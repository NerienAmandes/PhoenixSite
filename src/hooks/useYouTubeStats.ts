import { useState, useEffect, useCallback } from 'react'

export interface YouTubeStats {
  /**
   * Количество подписчиков. `-1` означает, что канал скрыл счётчик
   * (`hiddenSubscriberCount: true` в YouTube Data API) — в этом случае
   * показываем «—» вместо числа.
   */
  subscribers: number
  views: number
  videoCount: number
  channelId: string | null
  handle: string
  fetchedAt: string
  hiddenSubscribers?: boolean
}

interface State {
  data: YouTubeStats | null
  loading: boolean
  error: string | null
  /** Локальное «обновлено N сек назад» — обновляется таймером. */
  ageSeconds: number | null
  refetch: () => void
}

/**
 * Живая статистика YouTube-канала.
 *
 * - Сразу делает fetch при монтировании.
 * - Polling каждые `pollMs` миллисекунд (по умолчанию 5 минут).
 * - Дополнительно делает refetch при возвращении на вкладку
 *   (через document.visibilitychange), чтобы цифры не «протухали»,
 *   пока пользователь читал другую вкладку.
 * - Считает «возраст» данных в секундах, удобно для подписи «обновлено N сек назад».
 */
export function useYouTubeStats(pollMs = 5 * 60 * 1000): State {
  const [data, setData] = useState<YouTubeStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ageSeconds, setAgeSeconds] = useState<number | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/youtube-stats')
      if (!res.ok) {
        const errData = await res.json().catch(() => null)
        throw new Error(
          `API ${res.status}: ${errData?.error || res.statusText || 'request failed'}`
        )
      }
      const json: YouTubeStats = await res.json()
      setData(json)
      setAgeSeconds(0)
    } catch (err: any) {
      setError(err?.message || 'Network error')
    } finally {
      setLoading(false)
    }
  }, [])

  // Polling + visibility refetch
  useEffect(() => {
    load()
    const id = window.setInterval(load, pollMs)

    const onVisibility = () => {
      if (document.visibilityState === 'visible') load()
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [load, pollMs])

  // Тикаем «возраст» раз в секунду, чтобы подпись обновлялась
  useEffect(() => {
    if (!data) return
    const tick = () => {
      const seconds = Math.max(
        0,
        Math.floor((Date.now() - new Date(data.fetchedAt).getTime()) / 1000)
      )
      setAgeSeconds(seconds)
    }
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [data])

  return { data, loading, error, ageSeconds, refetch: load }
}
