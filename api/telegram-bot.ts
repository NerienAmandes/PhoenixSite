import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

/**
 * Webhook Telegram-бота FirePhoenix.
 *
 * Регистрация (один раз, руками или скриптом):
 *   curl "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook?url=https://<your-domain>/api/telegram-bot"
 *
 * Команды:
 *   /start  — подписаться на уведомления о новых релизах.
 *   /stop   — отписаться.
 *   /help   — краткая справка.
 *
 * Бот НЕ использует приватные данные — только публичные Telegram chat_id,
 * username и first_name. Пользователь явно подписывается через /start,
 * без подписки рассылка не работает.
 *
 * Безопасность:
 *   - секрет Telegram хранится в env TELEGRAM_BOT_TOKEN
 *   - доступ к Supabase — через SUPABASE_SERVICE_ROLE_KEY (server-only)
 *   - публичный anon-ключ НЕ используется
 */

// Создаём server-side клиент Supabase. Это безопасно только тут, в серверлесс,
// потому что service_role обходит RLS.
function makeServiceClient() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('Supabase env vars are missing (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)')
  }
  return createClient(url, key, { auth: { persistSession: false } })
}

type TGUpdate = {
  update_id?: number
  message?: {
    message_id?: number
    from?: { id: number; is_bot?: boolean; username?: string; first_name?: string }
    chat: { id: number; type: string }
    text?: string
    date?: number
  }
  edited_message?: TGUpdate['message']
}

const TG_API = (token: string, method: string) =>
  `https://api.telegram.org/bot${token}/${method}`

async function tgSendMessage(
  token: string,
  chatId: number,
  text: string,
  extra?: Record<string, unknown>,
): Promise<boolean> {
  try {
    const res = await fetch(TG_API(token, 'sendMessage'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        ...extra,
      }),
    })
    return res.ok
  } catch (err) {
    console.error('tgSendMessage failed:', err)
    return false
  }
}

const HELP_TEXT =
  '<b>FirePhoenix · бот уведомлений</b>\n\n' +
  'Я сообщу, когда команда FirePhoenix выпустит новый релиз.\n\n' +
  'Команды:\n' +
  '  /start — подписаться\n' +
  '  /stop  — отписаться\n' +
  '  /help  — эта справка\n\n' +
  'Чтобы подписаться — просто нажми /start.'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' })
  }

  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) {
    console.error('TELEGRAM_BOT_TOKEN is missing')
    // Возвращаем 200 — Telegram не должен ретраить на наших ошибках конфигурации.
    return res.status(200).json({ ok: false })
  }

  const update = req.body as TGUpdate | null
  const message = update?.message ?? update?.edited_message
  if (!message || !message.text) {
    return res.status(200).json({ ok: true })
  }

  const chatId = message.chat.id
  const text = message.text.trim()
  const from = message.from

  let supabase
  try {
    supabase = makeServiceClient()
  } catch (err) {
    console.error(err)
    return res.status(200).json({ ok: false })
  }

  try {
    if (text === '/start' || text.startsWith('/start ')) {
      // Upsert: переподписка, если был /stop.
      const { error } = await supabase.from('release_subscribers').upsert(
        {
          chat_id: chatId,
          username: from?.username ?? null,
          first_name: from?.first_name ?? null,
          active: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'chat_id' },
      )
      if (error) {
        console.error('Insert subscriber failed:', error)
        await tgSendMessage(
          token,
          chatId,
          'Не получилось подписаться — попробуй позже. Если ошибка повторяется, напиши @fire_PhoenixTeam.',
        )
        return res.status(200).json({ ok: true })
      }
      await tgSendMessage(
        token,
        chatId,
        '🔥 <b>Подписка оформлена!</b>\n\n' +
          'Теперь ты первым узнаешь о новых релизах FirePhoenix.\n\n' +
          'Отписаться: /stop',
      )
    } else if (text === '/stop' || text.startsWith('/stop ')) {
      const { error } = await supabase
        .from('release_subscribers')
        .update({ active: false, updated_at: new Date().toISOString() })
        .eq('chat_id', chatId)
      if (error) {
        console.error('Update subscriber failed:', error)
      }
      await tgSendMessage(
        token,
        chatId,
        'Отписался. Если захочешь вернуться — /start.',
      )
    } else if (text === '/help' || text.startsWith('/help ')) {
      await tgSendMessage(token, chatId, HELP_TEXT)
    } else {
      // Любой другой текст — подсказка.
      await tgSendMessage(
        token,
        chatId,
        'Нажми /start, чтобы подписаться на новые релизы. /help — справка.',
      )
    }
  } catch (err) {
    console.error('Bot handler error:', err)
  }

  // Telegram ждёт 200 ОК быстро. Если что-то упало — не отвечаем 500,
  // иначе Telegram будет ретраить webhook до 10 раз.
  return res.status(200).json({ ok: true })
}