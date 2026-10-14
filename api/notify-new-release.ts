import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

/**
 * Рассылка уведомлений о новом релизе подписчикам Telegram-бота.
 *
 * Защита: только POST с заголовком `x-notify-secret`, равным env
 * переменной NOTIFY_SECRET. Без правильного секрета возвращает 401.
 *
 * Body:
 *   { releaseId: string, releaseSlug?: string } — оба варианта принимаются.
 *
 * Использование из админки:
 *   await fetch('/api/notify-new-release', {
 *     method: 'POST',
 *     headers: { 'x-notify-secret': env.NOTIFY_SECRET },
 *     body: JSON.stringify({ releaseId }),
 *   })
 *
 * Если release_id не передан — функция попытается взять `slug`.
 */

function makeServiceClient() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('Supabase env vars are missing (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)')
  }
  return createClient(url, key, { auth: { persistSession: false } })
}

const TG_API = (token: string) => `https://api.telegram.org/bot${token}/sendMessage`

async function sendTelegram(token: string, chatId: number, text: string): Promise<boolean> {
  try {
    const res = await fetch(TG_API(token), {
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
      // Если бот заблокирован или чат не найден — деактивируем подписчика.
      const desc = (data as { description?: string }).description ?? ''
      if (
        res.status === 403 ||
        res.status === 404 ||
        desc.includes('bot was blocked') ||
        desc.includes('chat not found')
      ) {
        return false // сигнал — деактивировать
      }
    }
    return res.ok
  } catch {
    return true // сетевые ошибки не считаем как «отписался»
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function buildMessage(r: {
  title: string
  original_artist: string | null
  description: string | null
  platforms: Record<string, string | undefined>
  cover_url: string | null
}): string {
  const lines: string[] = ['🔥 <b>Новый релиз FirePhoenix!</b>', '']
  lines.push(`🎵 <b>${escapeHtml(r.title)}</b>`)
  if (r.original_artist) {
    lines.push(`Оригинал: ${escapeHtml(r.original_artist)}`)
  }
  if (r.description) {
    lines.push('')
    lines.push(escapeHtml(r.description.slice(0, 280)))
  }
  const yt = r.platforms?.youtube
  if (yt) {
    lines.push('')
    lines.push(`▶️ <a href="${escapeHtml(yt)}">Смотреть на YouTube</a>`)
  }
  lines.push('')
  lines.push('Отписаться: /stop')
  return lines.join('\n')
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' })
  }

  const secret = process.env.NOTIFY_SECRET
  if (!secret) {
    console.error('NOTIFY_SECRET is missing — endpoint disabled')
    return res.status(503).json({ ok: false, error: 'Endpoint disabled' })
  }
  if (req.headers['x-notify-secret'] !== secret) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' })
  }

  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) {
    return res.status(500).json({ ok: false, error: 'TELEGRAM_BOT_TOKEN is missing' })
  }

  let supabase
  try {
    supabase = makeServiceClient()
  } catch (err) {
    console.error(err)
    return res.status(500).json({ ok: false, error: 'Supabase not configured' })
  }

  const body = (typeof req.body === 'string' ? safeJson(req.body) : req.body) as {
    releaseId?: string
    releaseSlug?: string
  } | null
  if (!body || (!body.releaseId && !body.releaseSlug)) {
    return res
      .status(400)
      .json({ ok: false, error: 'releaseId or releaseSlug is required' })
  }

  // 1) Подтягиваем релиз. По id (uuid) или по slug.
  let release: any = null
  let releaseError: string | null = null

  if (body.releaseId) {
    const { data, error } = await supabase
      .from('releases')
      .select('title, original_artist, description, platforms, cover_url, slug, status, is_published')
      .eq('id', body.releaseId)
      .maybeSingle()
    release = data
    releaseError = error?.message ?? null
  } else if (body.releaseSlug) {
    const { data, error } = await supabase
      .from('releases')
      .select('title, original_artist, description, platforms, cover_url, slug, status, is_published')
      .eq('slug', body.releaseSlug)
      .maybeSingle()
    release = data
    releaseError = error?.message ?? null
  }

  if (releaseError || !release) {
    return res
      .status(404)
      .json({ ok: false, error: releaseError ?? 'Release not found' })
  }

  if (release.status !== 'released' || !release.is_published) {
    return res.status(200).json({ ok: true, skipped: 'not released/published' })
  }

  // 2) Подтягиваем активных подписчиков.
  const { data: subs, error: subErr } = await supabase
    .from('release_subscribers')
    .select('chat_id')
    .eq('active', true)
    .limit(5000) // безопасный лимит; в БД больше и не ожидается
  if (subErr) {
    return res.status(500).json({ ok: false, error: subErr.message })
  }

  const text = buildMessage(release)
  let sent = 0
  let deactivated = 0
  const failedChatIds: number[] = []

  // Telegram API разрешает ~30 сообщений/сек на бота; здесь сериализуем.
  for (const sub of subs ?? []) {
    const ok = await sendTelegram(token, sub.chat_id, text)
    if (ok) {
      sent += 1
    } else {
      failedChatIds.push(sub.chat_id)
    }
  }

  if (failedChatIds.length > 0) {
    // Деактивируем тех, кто заблокировал бота или удалил чат.
    await supabase
      .from('release_subscribers')
      .update({ active: false, updated_at: new Date().toISOString() })
      .in('chat_id', failedChatIds)
    deactivated = failedChatIds.length
  }

  // Фиксируем last_notified на самых «свежих» отправленных.
  if (sent > 0) {
    const okIds = (subs ?? [])
      .map((s) => s.chat_id)
      .filter((id) => !failedChatIds.includes(id))
    await supabase
      .from('release_subscribers')
      .update({ last_notified: new Date().toISOString() })
      .in('chat_id', okIds.slice(0, 500)) // не злоупотребляем size запросом
  }

  return res.status(200).json({
    ok: true,
    sent,
    deactivated,
    total: subs?.length ?? 0,
  })
}

function safeJson(s: string): unknown {
  try {
    return JSON.parse(s)
  } catch {
    return null
  }
}