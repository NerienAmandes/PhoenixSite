import type { VercelRequest, VercelResponse } from '@vercel/node'
import pool from '../src/lib/db'

const TG_API = (token: string) =>
  `https://api.telegram.org/bot${token}/sendMessage`

/**
 * Возвращает дату в формате MM.DD для часового пояса Европы/Москва (UTC+3).
 * offsetDays — сдвиг в днях от сегодня.
 */
function getMoscowMMDD(offsetDays = 0): string {
  const MSK_OFFSET = 3 * 60 * 60 * 1000
  const now = new Date()
  const moscow = new Date(
    now.getTime() + MSK_OFFSET + offsetDays * 24 * 60 * 60 * 1000
  )
  const mm = String(moscow.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(moscow.getUTCDate()).padStart(2, '0')
  return `${mm}.${dd}`
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

/** Превращает MM.DD в читаемую строку, например «7 декабря». */
function formatBirthDate(mmdd: string): string {
  const [mm, dd] = mmdd.split('.')
  const day = parseInt(dd ?? '0', 10)
  const monthIdx = parseInt(mm ?? '0', 10) - 1
  if (!day || monthIdx < 0 || monthIdx > 11) return mmdd
  return `${day} ${MONTHS_GENITIVE[monthIdx]}`
}

interface BirthdayMember {
  display_name: string
  birth_mmdd: string
}

interface Subscriber {
  chat_id: number
}

/**
 * Endpoint ежедневной проверки дней рождения.
 * Вызывается внешним cron'ом (например, cron-job.org) раз в день.
 *
 * Логика:
 *   1. Берём сегодняшнюю дату (МСК) и дату +2 дня в формате MM.DD.
 *   2. Запрашиваем из БД участников, у которых birth_mmdd совпадает.
 *   3. Рассылаем напоминания всем активным подписчикам.
 *
 * Защита от повторных отправок в один день:
 *   Проверяем поле last_notified подписчика (в таймзоне МСК).
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const cronSecret = process.env.CRON_SECRET

  if (!token) {
    console.error('[birthday-check] TELEGRAM_BOT_TOKEN not set')
    return res
      .status(500)
      .json({ ok: false, error: 'Server is not configured' })
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

  const todayMMDD = getMoscowMMDD(0)
  const inTwoDaysMMDD = getMoscowMMDD(2)

  try {
    // Участники, у кого ДР сегодня или через 2 дня.
    const { rows: members } = await pool.query<BirthdayMember>(
      `SELECT display_name, birth_mmdd
       FROM members
       WHERE birth_mmdd IN ($1, $2)
         AND is_published = true`,
      [todayMMDD, inTwoDaysMMDD]
    )

    if (members.length === 0) {
      return res.status(200).json({
        ok: true,
        message: 'Нет дней рождения сегодня или через 2 дня',
        today: todayMMDD,
        inTwoDays: inTwoDaysMMDD,
        members: 0,
        sent: 0,
      })
    }

    // Активные подписчики, которым ещё не отправляли сегодня.
    const { rows: subscribers } = await pool.query<Subscriber>(
      `SELECT chat_id
       FROM release_subscribers
       WHERE active = true
         AND (
           last_notified IS NULL
           OR (last_notified AT TIME ZONE 'Europe/Moscow')::date
              < (now() AT TIME ZONE 'Europe/Moscow')::date
         )`
    )

    if (subscribers.length === 0) {
      return res.status(200).json({
        ok: true,
        message: 'Нет активных подписчиков для рассылки',
        members: members.length,
        sent: 0,
      })
    }

    let sentCount = 0

    for (const member of members) {
      const isToday = member.birth_mmdd === todayMMDD
      const dateStr = formatBirthDate(member.birth_mmdd)

      const text = isToday
        ? `🎉 Сегодня, <b>${dateStr}</b>, день рождения у <b>${member.display_name}</b>! Поздравляем! 🎂`
        : `⏰ Через 2 дня, <b>${dateStr}</b>, день рождения у <b>${member.display_name}</b>. Не забудьте поздравить! 🎁`

      for (const sub of subscribers) {
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
              await pool.query(
                `UPDATE release_subscribers SET active = false WHERE chat_id = $1`,
                [sub.chat_id]
              )
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
    await pool.query(
      `UPDATE release_subscribers SET last_notified = now() WHERE active = true`
    )

    return res.status(200).json({
      ok: true,
      today: todayMMDD,
      inTwoDays: inTwoDaysMMDD,
      members: members.length,
      subscribers: subscribers.length,
      sent: sentCount,
    })
  } catch (err) {
    console.error('[birthday-check] error:', err)
    return res.status(500).json({ ok: false, error: 'Internal error' })
  }
}
