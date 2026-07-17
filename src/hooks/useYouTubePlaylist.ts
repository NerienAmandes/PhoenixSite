import { useState, useEffect } from 'react'

interface YouTubePlaylistItem {
  id: string
  title: string
  youtubeId: string
  type: 'cover'
  thumbnail: string
}

export function useYouTubePlaylist() {
  const [videos, setVideos] = useState<YouTubePlaylistItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/youtube')

        if (!res.ok) {
          const errData = await res.json().catch(() => null)
          const errMsg = `API ${res.status}: ${errData?.error || res.statusText}`
          console.error('Ошибка загрузки:', errMsg)
          setError(errMsg)
          setVideos([])
          return
        }

        const data = await res.json()

        if (!data.items || data.items.length === 0) {
          console.warn('Плейлист пуст')
          setVideos([])
          return
        }

        const items: YouTubePlaylistItem[] = data.items.map((item: any) => ({
          id: item.id,
          title: item.title,
          youtubeId: item.youtubeId,
          type: 'cover' as const,
          thumbnail: item.thumbnail,
        }))

        setVideos(items)
      } catch (err: any) {
        console.error('Сетевая ошибка:', err)
        setError(`Сетевая ошибка: ${err.message}`)
        setVideos([])
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
  }, [])

  return { videos, loading, error }
}
