import type { VercelRequest, VercelResponse } from '@vercel/node'
import supabase from '../src/lib/db'

const TG_API = (token: string, method: string) =>
  `https://api.telegram.org/bot${token}/${method}`

async function sendMessage(
  token: string,
  chatId: number,
  text: string
): Promise<void> {
  const res = await fetch(TG_API(token, 'sendMessage'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    console.error(`[telegram-webhook] sendMessage failed:`, data)
  }
}

/**
 * Webhook для Telegram-бота.
 * Обрабатывает команды:
 *   /start  — подписаться на напоминания о днях рождения
 *   /stop   — отписаться
 *   /help   — справка
 *
 * Подписчики сохраняются в таблицу release_subscribers.
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' })
  }

  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) {
    console.error('[telegram-webhook] TELEGRAM_BOT_TOKEN not set')
    return res
      .status(500)
      .json({ ok: false, error: 'Server is not configured' })
  }

  const body = req.body as {
    message?: {
      chat: { id: number; first_name?: string; username?: string }
      text?: string
    }
  } | null

  const msg = body?.message
  if (!msg || !msg.text) {
    return res.status(200).json({ ok: true })
  }

  const chatId = msg.chat.id
  const firstName = msg.chat.first_name ?? ''
  const username = msg.chat.username ?? null
  const text = msg.text.trim().toLowerCase()

  try {
    if (text === '/start' || text.startsWith('/start@')) {
      // Upsert подписчика
      const { error } = await supabase.from('release_subscribers').upsert(
        {
          chat_id: chatId,
          username,
          first_name: firstName,
          active: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'chat_id' }
      )
      if (error) throw error

      await sendMessage(
        token,
        chatId,
        `👋 Привет, ${firstName || 'друг'}!\n\n` +
          `Ты подписался на напоминания о днях рождения участников команды <b>FirePhoenix</b>.\n\n` +
          `Я буду напоминать:\n` +
          `• за 2 дня до дня рождения\n` +
          `• в сам день рождения\n\n` +
          `Команды:\n` +
          `/stop — отписаться от напоминаний\n` +
          `/help — справка`
      )
    } else if (text === '/stop' || text.startsWith('/stop@')) {
      const { error } = await supabase
        .from('release_subscribers')
        .update({ active: false, updated_at: new Date().toISOString() })
        .eq('chat_id', chatId)
      if (error) throw error

      await sendMessage(
        token,
        chatId,
        `😔 Ты отписался от напоминаний о днях рождения.\nНапиши /start, чтобы подписаться снова.`
      )
    } else if (text === '/help' || text.startsWith('/help@')) {
      await sendMessage(
        token,
        chatId,
        `🎂 <b>Бот напоминаний о днях рождения FirePhoenix</b>\n\n` +
          `/start — подписаться на напоминания\n` +
          `/stop — отписаться\n` +
          `/help — эта справка\n\n` +
          `Напоминания приходят за 2 дня и в день рождения участника.`
      )
    } else {
      await sendMessage(
        token,
        chatId,
        `Я умею только напоминать о днях рождения участников команды.\nНапиши /help, чтобы узнать доступные команды.`
      )
    }
  } catch (err) {
    console.error('[telegram-webhook] handler error:', err)
    try {
      await sendMessage(
        token,
        chatId,
        `⚠️ Произошла внутренняя ошибка. Попробуй ещё раз позже.`
      )
    } catch {
      /* ignore */
    }
  }

  return res.status(200).json({ ok: true })
}
