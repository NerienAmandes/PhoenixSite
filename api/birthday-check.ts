import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

/**
 * Server-side клиент Supabase с service_role ключом.
 * Используется только в серверлесс-функциях, обходит RLS.
 */
function makeServiceClient() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error(
      'Supabase env vars are missing (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)'
    )
  }
  return createClient(url, key, { auth: { persistSession: false } })
}

const TG_API = (token: string) =>
  `https://api.telegram.org/bot${token}/sendMessage`

/**
 * Возвращает дату в формате DD.MM для часового пояса Европы/Москва (UTC+3).
 * offsetDays — сдвиг в днях от сегодня.
 *
 * ВАЖНО: в БД (members.birth_mmdd) даты хранятся в формате DD.MM
 * (см. админку AdminMembersPage — лейбл «Дата рождения (DD.MM)»).
 */
function getMoscowDDMM(offsetDays = 0): string {
  const MSK_OFFSET = 3 * 60 * 60 * 1000
  const now = new Date()
  const moscow = new Date(
    now.getTime() + MSK_OFFSET + offsetDays * 24 * 60 * 60 * 1000
  )
  const dd = String(moscow.getUTCDate()).padStart(2, '0')
  const mm = String(moscow.getUTCMonth() + 1).padStart(2, '0')
  return `${dd}.${mm}`
}

/** Возвращает сегодняшнюю дату в МСК в ISO формате (YYYY-MM-DD). */
function getMoscowTodayISO(): string {
  const MSK_OFFSET = 3 * 60 * 60 * 1000
  const now = new Date()
  const moscow = new Date(now.getTime() + MSK_OFFSET)
  return moscow.toISOString().slice(0, 10)
}

const MONTHS_GENITIVE = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
]

/** Превращает DD.MM в читаемую строку, например «7 декабря». */
function formatBirthDate(ddmm: string): string {
  const [dd, mm] = ddmm.split('.')
  const day = parseInt(dd ?? '0', 10)
  const monthIdx = parseInt(mm ?? '0', 10) - 1
  if (!day || monthIdx < 0 || monthIdx > 11) return ddmm
  return `${day} ${MONTHS_GENITIVE[monthIdx]}`
}

interface BirthdayMember {
  display_name: string
  birth_mmdd: string
}

interface Subscriber {
  chat_id: number
  last_notified: string | null
}

/**
 * Endpoint ежедневной проверки дней рождения.
 * Вызывается GitHub Actions / cron'ом раз в день.
 *
 * Логика:
 *   1. Берём сегодняшнюю дату (МСК) и дату +2 дня в формате DD.MM.
 *   2. Запрашиваем из БД участников, у которых birth_mmdd совпадает.
 *   3. Рассылаем напоминания всем активным подписчикам,
 *      которым ещё не отправляли сегодня.
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const cronSecret = process.env.CRON_SECRET

  if (!token) {
    console.error('[birthday-check] TELEGRAM_BOT_TOKEN not set')
    return res.status(500).json({ ok: false, error: 'TELEGRAM_BOT_TOKEN is missing' })
  }

  // Защита endpoint'а секретным ключом (если задан в окружении).
  if (cronSecret) {
    const provided =
      (req.headers['x-cron-secret'] as string | undefined) ||
      (req.query.secret as string | undefined)
    if (provided !== cronSecret) {
      return res.status(403).json({ ok: false, error: 'Forbidden' })
    }
  }

  const todayDDMM = getMoscowDDMM(0)
  const inTwoDaysDDMM = getMoscowDDMM(2)
  const todayISO = getMoscowTodayISO()

  let supabase
  try {
    supabase = makeServiceClient()
  } catch (err) {
    console.error('[birthday-check]', err)
    return res.status(500).json({ ok: false, error: 'Supabase not configured' })
  }

  try {
    // Участники, у кого ДР сегодня или через 2 дня.
    const { data: members, error: membersError } = await supabase
      .from('members')
      .select('display_name, birth_mmdd')
      .in('birth_mmdd', [todayDDMM, inTwoDaysDDMM])
      .eq('is_published', true)

    if (membersError) throw membersError

    if (!members || members.length === 0) {
      return res.status(200).json({
        ok: true,
        message: 'Нет дней рождения сегодня или через 2 дня',
        today: todayDDMM,
        inTwoDays: inTwoDaysDDMM,
        members: 0,
        sent: 0,
      })
    }

    // Активные подписчики.
    const { data: subscribers, error: subsError } = await supabase
      .from('release_subscribers')
      .select('chat_id, last_notified')
      .eq('active', true)

    if (subsError) throw subsError

    // Оставляем только тех, кому не отправляли сегодня (по МСК).
    const recipients = (subscribers ?? []).filter((s) => {
      if (!s.last_notified) return true
      const notifiedDate = new Date(s.last_notified)
        .toISOString()
        .slice(0, 10)
      return notifiedDate !== todayISO
    })

    if (recipients.length === 0) {
      return res.status(200).json({
        ok: true,
        message: 'Нет активных подписчиков для рассылки (уже отправлено сегодня)',
        members: members.length,
        sent: 0,
      })
    }

    let sentCount = 0
    const nowISO = new Date().toISOString()

    for (const member of members as BirthdayMember[]) {
      const isToday = member.birth_mmdd === todayDDMM
      const dateStr = formatBirthDate(member.birth_mmdd)

      const text = isToday
        ? `🎉 Сегодня, <b>${dateStr}</b>, день рождения у <b>${member.display_name}</b>! Поздравляем! 🎂`
        : `⏰ Через 2 дня, <b>${dateStr}</b>, день рождения у <b>${member.display_name}</b>. Не забудьте поздравить! 🎁`

      for (const sub of recipients) {
        try {
          const tgRes = await fetch(TG_API(token), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: sub.chat_id,
              text,
              parse_mode: 'HTML',
              disable_web_page_preview: true,
            }),
          })
          if (!tgRes.ok) {
            const data = await tgRes.json().catch(() => ({}))
            console.error(
              `[birthday-check] failed to send to ${sub.chat_id}:`,
              data
            )
            // Если бот заблокирован пользователем — деактивируем подписку.
            if (data?.error_code === 403) {
              await supabase
                .from('release_subscribers')
                .update({ active: false, updated_at: nowISO })
                .eq('chat_id', sub.chat_id)
            }
          } else {
            sentCount++
          }
        } catch (err) {
          console.error(
            `[birthday-check] network error sending to ${sub.chat_id}:`,
            err
          )
        }
      }
    }

    // Обновляем last_notified для всех активных подписчиков.
    const chatIds = recipients.map((s) => s.chat_id)
    const { error: updateError } = await supabase
      .from('release_subscribers')
      .update({ last_notified: nowISO, updated_at: nowISO })
      .in('chat_id', chatIds)

    if (updateError) {
      console.error('[birthday-check] failed to update last_notified:', updateError)
    }

    return res.status(200).json({
      ok: true,
      today: todayDDMM,
      inTwoDays: inTwoDaysDDMM,
      members: members.length,
      subscribers: recipients.length,
      sent: sentCount,
    })
  } catch (err) {
    console.error('[birthday-check] error:', err)
    return res.status(500).json({ ok: false, error: 'Internal error' })
  }
}
