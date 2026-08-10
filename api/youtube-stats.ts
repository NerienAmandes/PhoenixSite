import type { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * YouTube-статистика канала: подписчики, просмотры, количество видео.
 *
 * Использует YouTube Data API v3 → endpoint `channels?part=statistics`.
 * Работает по handle канала (например, @firephoenix6297), не требует знать channel ID.
 *
 * Кэш — 5 минут на уровне модуля. Vercel держит инстанс функции «тёплым»
 * несколько минут между вызовами, так что это снижает расход квоты
 * (1 unit / запрос) и ускоряет ответ. После протухания — кэш пересоздаётся.
 */

type CachedStats = {
  subscribers: number
  views: number
  videoCount: number
  handle: string
  channelId: string | null
  fetchedAt: number
}

const CACHE_TTL_MS = 5 * 60 * 1000 // 5 минут

// Module-level кэш. Vercel хранит инстанс «тёплым» между вызовами,
// так что простой `let` тут работает как мемоизация.
let cache: CachedStats | null = null

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const apiKey = process.env.YOUTUBE_API_KEY
  const handle = process.env.YOUTUBE_CHANNEL_HANDLE

  if (!apiKey) {
    return res.status(500).json({
      error: 'Server configuration error: YOUTUBE_API_KEY not set',
    })
  }
  if (!handle) {
    return res.status(500).json({
      error: 'Server configuration error: YOUTUBE_CHANNEL_HANDLE not set',
    })
  }

  // Отдаём из кэша, если он свежий
  const now = Date.now()
  if (cache && now - cache.fetchedAt < CACHE_TTL_MS) {
    res.setHeader('X-Cache', 'HIT')
    return res.status(200).json({
      subscribers: cache.subscribers,
      views: cache.views,
      videoCount: cache.videoCount,
      channelId: cache.channelId,
      handle: cache.handle,
      fetchedAt: new Date(cache.fetchedAt).toISOString(),
    })
  }

  try {
    const url =
      `https://www.googleapis.com/youtube/v3/channels` +
      `?part=statistics&forHandle=${encodeURIComponent(handle)}&key=${apiKey}`

    const ytRes = await fetch(url)

    if (!ytRes.ok) {
      const errData = await ytRes.json().catch(() => null)
      return res.status(ytRes.status).json({
        error: errData?.error?.message || `YouTube API error: ${ytRes.status}`,
      })
    }

    const data = await ytRes.json()
    const item = data.items?.[0]
    if (!item) {
      return res.status(404).json({
        error: `Channel with handle "${handle}" not found`,
      })
    }

    const stats = item.statistics || {}
    // Поле hiddenSubscriberCount=true означает, что канал скрыл счётчик.
    // YouTube в этом случае не возвращает subscriberCount вовсе — ставим -1,
    // чтобы фронт мог отличить «скрыто» от «0 подписчиков».
    const hiddenSubs = Boolean(stats.hiddenSubscriberCount)
    const subscribers = hiddenSubs ? -1 : Number(stats.subscriberCount ?? 0)
    cache = {
      subscribers,
      views: Number(stats.viewCount ?? 0),
      videoCount: Number(stats.videoCount ?? 0),
      handle,
      channelId: item.id ?? null,
      fetchedAt: now,
    }

    res.setHeader('X-Cache', 'MISS')
    return res.status(200).json({
      subscribers: cache.subscribers,
      views: cache.views,
      videoCount: cache.videoCount,
      hiddenSubscribers: hiddenSubs,
      channelId: cache.channelId,
      handle: cache.handle,
      fetchedAt: new Date(cache.fetchedAt).toISOString(),
    })
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Unknown error' })
  }
}
