import type { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * YouTube-статистика канала: подписчики, просмотры, количество видео.
 *
 * Использует YouTube Data API v3 → endpoint `channels?part=statistics`.
 * Работает по handle канала (например, @firephoenix6297), не требует знать channel ID.
 *
 * Кэш — 5 минут в памяти инстанса. Vercel может держать функцию «тёплой»
 * какое-то время, так что это снижает расход квоты (1 unit / запрос) и
 * ускоряет ответ. Если хоста в памяти нет — кэш пересоздаётся.
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

// В dev-режиме Vercel модули могут пересоздаваться; глобал в globalThis
// переживает hot reload в dev и работает в проде.
declare global {
  // eslint-disable-next-line no-var
  var __ytStatsCache: CachedStats | undefined
}

const cache: { value: CachedStats | null } = {
  value: globalThis.__ytStatsCache ?? null,
}

function setCache(value: CachedStats) {
  cache.value = value
  globalThis.__ytStatsCache = value
}

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
  if (cache.value && now - cache.value.fetchedAt < CACHE_TTL_MS) {
    res.setHeader('X-Cache', 'HIT')
    return res.status(200).json({
      subscribers: cache.value.subscribers,
      views: cache.value.views,
      videoCount: cache.value.videoCount,
      channelId: cache.value.channelId,
      handle: cache.value.handle,
      fetchedAt: new Date(cache.value.fetchedAt).toISOString(),
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
    const cached: CachedStats = {
      subscribers: Number(stats.subscriberCount ?? 0),
      views: Number(stats.viewCount ?? 0),
      videoCount: Number(stats.videoCount ?? 0),
      handle,
      channelId: item.id ?? null,
      fetchedAt: now,
    }
    setCache(cached)

    res.setHeader('X-Cache', 'MISS')
    return res.status(200).json({
      subscribers: cached.subscribers,
      views: cached.views,
      videoCount: cached.videoCount,
      channelId: cached.channelId,
      handle: cached.handle,
      fetchedAt: new Date(cached.fetchedAt).toISOString(),
    })
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Unknown error' })
  }
}
