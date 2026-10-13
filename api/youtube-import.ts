/**
 * api/youtube-import.ts
 *
 * Vercel serverless function: подтягивает новые видео с YouTube-канала
 * через публичный RSS-фид (без API-ключа) и создаёт upcoming-релизы
 * в Supabase. Запускается автоматически по Vercel cron.
 *
 * Безопасность:
 *   - требует Bearer-токен из заголовка Authorization или ?secret=
 *   - использует service_role, чтобы обходить RLS (anon не имеет прав на INSERT)
 *
 * ENV-переменные (задаются в Vercel → Settings → Environment Variables):
 *   - SUPABASE_URL: https://xxx.supabase.co
 *   - SUPABASE_SERVICE_ROLE_KEY: service_role ключ (НЕ anon!)
 *   - YOUTUBE_CHANNEL_ID: ID канала, вида UCxxxxxxxxxxxxxxxxxx
 *   - CRON_SECRET: случайная строка (та же, что в api/ping-supabase.ts)
 *
 * Ручной запуск (для отладки):
 *   curl -i "https://<домен>/api/youtube-import?secret=$CRON_SECRET"
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

type Entry = {
  videoId: string
  title: string
  published: string // YYYY-MM-DD
  thumbnail: string
  description: string
}

export default async function handler(req: Request): Promise<Response> {
  // ----- 1. Auth -----
  const url = new URL(req.url)
  const querySecret = url.searchParams.get('secret')
  const headerSecret = req.headers
    .get('authorization')
    ?.replace(/^Bearer\s+/i, '')
  const provided = querySecret || headerSecret || ''
  const expected = process.env.CRON_SECRET || ''
  if (!expected) {
    return json({ error: 'CRON_SECRET не задан в env' }, 500)
  }
  if (provided !== expected) {
    return json({ error: 'Unauthorized' }, 401)
  }

  // ----- 2. Channel ID -----
  const channelId =
    url.searchParams.get('channel_id') || process.env.YOUTUBE_CHANNEL_ID
  if (!channelId) {
    return json(
      {
        error:
          'Не задан YOUTUBE_CHANNEL_ID (env-переменная Vercel) и не передан ?channel_id=',
      },
      400,
    )
  }

  // ----- 3. Supabase client (service_role, обходит RLS) -----
  const supabaseUrl = process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) {
    return json(
      { error: 'SUPABASE_URL или SUPABASE_SERVICE_ROLE_KEY не заданы' },
      500,
    )
  }
  const supabase: SupabaseClient = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  // ----- 4. Fetch RSS -----
  const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(
    channelId,
  )}`
  let xml: string
  try {
    const rssRes = await fetch(rssUrl, {
      headers: { 'user-agent': 'PhoenixSite-YouTubeImport/1.0' },
    })
    if (!rssRes.ok) {
      return json(
        { error: `YouTube RSS вернул ${rssRes.status}` },
        502,
      )
    }
    xml = await rssRes.text()
  } catch (e) {
    return json(
      { error: 'Не удалось обратиться к YouTube RSS: ' + String(e) },
      502,
    )
  }

  // ----- 5. Parse entries -----
  const entries = parseEntries(xml)
  if (entries.length === 0) {
    return json({
      ok: true,
      fetched: 0,
      new: 0,
      inserted: 0,
      skipped: 0,
      message: 'RSS пустой или не распарсился',
    })
  }

  // ----- 6. Existing video IDs -----
  const { data: existing, error: exErr } = await supabase
    .from('releases')
    .select('platforms')
  if (exErr) {
    return json({ error: 'Supabase SELECT упал: ' + exErr.message }, 500)
  }
  const known = new Set<string>()
  const ytIdRe =
    /(?:v=|youtu\.be\/|embed\/|shorts\/)([a-zA-Z0-9_-]{11})/
  for (const r of existing ?? []) {
    const yt = (r as { platforms?: { youtube?: string } }).platforms?.youtube
    if (!yt) continue
    const m = String(yt).match(ytIdRe)
    if (m) known.add(m[1])
  }

  // ----- 7. Insert new ones -----
  const fresh = entries.filter((e) => !known.has(e.videoId))
  let inserted = 0
  const errors: string[] = []
  for (const entry of fresh) {
    const slug = ensureUniqueSlug(
      slugify(entry.title) || `video-${entry.videoId}`,
      // ensureUniqueSlug получит the «дополнение» videoId, чтобы коллизий не было
      entry.videoId,
    )

    // original_artist — эвристика по title
    const originalArtist = tryExtractOriginalArtist(entry.title)

    const { error: insErr } = await supabase.from('releases').insert({
      slug,
      title: entry.title,
      original_artist: originalArtist,
      cover_url: entry.thumbnail,
      release_date: entry.published || null,
      status: 'upcoming',
      platforms: {
        youtube: `https://www.youtube.com/watch?v=${entry.videoId}`,
      },
      description: entry.description || null,
      current_stage: 0,
      is_published: true,
    })
    if (insErr) {
      errors.push(`${entry.videoId}: ${insErr.message}`)
    } else {
      inserted++
    }
  }

  return json({
    ok: true,
    fetched: entries.length,
    new: fresh.length,
    inserted,
    failed: errors.length,
    errors: errors.slice(0, 5),
    channel_id: channelId,
    fetched_at: new Date().toISOString(),
  })
}

// =====================================================================
// helpers
// =====================================================================

function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload, null, 2), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  })
}

/**
 * Простой regex-парсер YouTube RSS.
 * YouTube RSS стабильный — поля предсказуемые, namespace стабильный.
 *
 * Структура каждого <entry>:
 *   <entry>
 *     <id>yt:video:VIDEO_ID</id>
 *     <title>...</title>
 *     <published>YYYY-MM-DDTHH:MM:SS+00:00</published>
 *     <media:group>
 *       <media:description>...</media:description>
 *       <media:thumbnail url="https://i1.ytimg.com/vi/VIDEO_ID/hqdefault.jpg"/>
 *     </media:group>
 *   </entry>
 */
function parseEntries(xml: string): Entry[] {
  const entries: Entry[] = []
  const entryRe = /<entry>([\s\S]*?)<\/entry>/g
  let m: RegExpExecArray | null
  while ((m = entryRe.exec(xml)) !== null) {
    const block = m[1]
    const videoId = matchOne(block, /<yt:videoId>([^<]+)<\/yt:videoId>/)
      ?? matchOne(block, /<id>yt:video:([^<]+)<\/id>/)
    if (!videoId) continue
    const title = decodeXml(
      matchOne(block, /<title>([\s\S]*?)<\/title>/) ?? '',
    ).trim()
    const publishedRaw =
      matchOne(block, /<published>([^<]+)<\/published>/) ?? ''
    const published = publishedRaw.slice(0, 10) // YYYY-MM-DD
    const thumbnail =
      matchOne(block, /<media:thumbnail[^>]*url="([^"]+)"/) ??
      `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
    const description = decodeXml(
      matchOne(block, /<media:description>([\s\S]*?)<\/media:description>/) ?? '',
    ).trim()
    entries.push({ videoId, title, published, thumbnail, description })
  }
  return entries
}

function matchOne(s: string, re: RegExp): string | null {
  const m = s.match(re)
  return m ? m[1] : null
}

/** Декодирует XML entities (&amp; &lt; &gt; &quot; &#39; и т.д.) */
function decodeXml(s: string): string {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9а-яё]+/giu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64)
}

/** Гарантирует уникальность slug, дописывая videoId при необходимости. */
function ensureUniqueSlug(base: string, videoId: string): string {
  const trimmed = base || 'video'
  return `${trimmed}-${videoId}`
}

/** Та же эвристика, что в src/lib/youtube.ts — дублируем, чтобы не зависеть от фронта. */
function tryExtractOriginalArtist(title: string): string | null {
  if (!title) return null
  const separators = [' — ', ' – ', ' | ', ' / ', ' - ']
  for (const sep of separators) {
    const idx = title.indexOf(sep)
    if (idx > 0 && idx < title.length - sep.length) {
      const right = title.slice(idx + sep.length).trim()
      if (right && right.length <= 80 && !/[\[\(\{]/.test(right)) {
        return right
      }
    }
  }
  return null
}