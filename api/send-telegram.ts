import type { VercelRequest, VercelResponse } from '@vercel/node'

type Payload = {
  name?: string
  email?: string
  instrument?: string
  experience?: string
  message?: string
  // Опционально — тип заявки, чтобы рендерить по-разному.
  // 'service' (по умолчанию) — адаптация, 'join' — набор, 'cover' — кавер.
  type?: 'service' | 'join' | 'cover'
  // Honeypot
  website?: string
}

const TG_API = (token: string) => `https://api.telegram.org/bot${token}/sendMessage`

// Простой in-memory rate limit: 5 заявок / 10 минут на IP.
const RATE_WINDOW_MS = 10 * 60 * 1000
const RATE_MAX = 5
const hits = new Map<string, number[]>()

function getClientIp(req: VercelRequest): string {
  const fwd = req.headers['x-forwarded-for']
  if (typeof fwd === 'string') return fwd.split(',')[0]!.trim()
  if (Array.isArray(fwd) && fwd[0]) return fwd[0]
  return req.socket?.remoteAddress ?? 'unknown'
}

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS)
  if (arr.length >= RATE_MAX) {
    hits.set(ip, arr)
    return true
  }
  arr.push(now)
  hits.set(ip, arr)
  return false
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const TYPE_HEADERS: Record<NonNullable<Payload['type']>, string> = {
  service: '🆕 <b>Новая заявка — Услуги (адаптация)</b>',
  join: '🆕 <b>Новый отклик — Набор в группу</b>',
  cover: '🎤 <b>Новый заказ — Кавер</b>',
}

const TYPE_INSTRUMENT_LABEL: Record<NonNullable<Payload['type']>, string> = {
  service: 'Пакет',
  join: 'Вакансия',
  cover: 'Пакет кавера',
}

function buildMessage(p: Payload): string {
  const type: NonNullable<Payload['type']> = p.type ?? 'service'
  const lines: string[] = [TYPE_HEADERS[type], '']
  if (p.name) lines.push(`👤 <b>Имя:</b> ${escapeHtml(p.name)}`)
  if (p.email) lines.push(`📧 <b>Контакт:</b> ${escapeHtml(p.email)}`)
  if (p.instrument) {
    lines.push(`📦 <b>${TYPE_INSTRUMENT_LABEL[type]}:</b> ${escapeHtml(p.instrument)}`)
  }
  if (p.experience) {
    const label = type === 'cover' ? 'Оригинальный трек' : 'Опыт / трек'
    lines.push(`🎵 <b>${label}:</b> ${escapeHtml(p.experience)}`)
  }
  if (p.message) {
    lines.push('')
    lines.push(`💬 <b>Сообщение:</b>\n${escapeHtml(p.message)}`)
  }
  return lines.join('\n')
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' })
  }

  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!token || !chatId) {
    console.error('Telegram env vars are missing')
    return res.status(500).json({
      ok: false,
      error: 'Server is not configured (missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID)',
    })
  }

  const ip = getClientIp(req)
  if (isRateLimited(ip)) {
    return res.status(429).json({
      ok: false,
      error: 'Too many requests. Попробуйте через несколько минут.',
    })
  }

  const body = (typeof req.body === 'string' ? safeJson(req.body) : req.body) as Payload | null
  if (!body || !body.name || !body.email) {
    return res.status(400).json({ ok: false, error: 'Missing required fields' })
  }

  // Honeypot
  if (body.website && body.website.trim().length > 0) {
    return res.status(200).json({ ok: true })
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    return res.status(400).json({ ok: false, error: 'Invalid email' })
  }
  if (body.name.trim().length < 2 || body.name.length > 100) {
    return res.status(400).json({ ok: false, error: 'Invalid name' })
  }

  const text = buildMessage(body)

  try {
    const tgRes = await fetch(TG_API(token), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    })

    const data = await tgRes.json().catch(() => ({}))
    if (!tgRes.ok || !data.ok) {
      console.error('Telegram API error:', data)
      return res.status(502).json({ ok: false, error: 'Telegram rejected the message' })
    }

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('Failed to call Telegram:', err)
    return res.status(500).json({ ok: false, error: 'Internal error' })
  }
}

function safeJson(s: string): unknown {
  try {
    return JSON.parse(s)
  } catch {
    return null
  }
}
