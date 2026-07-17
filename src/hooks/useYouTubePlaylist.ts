import { useState, useEffect } from 'react'

interface YouTubePlaylistItem {
  id: string
  title: string
  youtubeId: string
  type: 'cover' | 'live' | 'shorts'
  thumbnail: string
}

export function useYouTubePlaylist() {
  const [videos, setVideos] = useState<YouTubePlaylistItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY
    const playlistId = import.meta.env.VITE_YOUTUBE_PLAYLIST_ID

    if (!apiKey || !playlistId) {
      console.warn('YouTube API ключ или ID плейлиста не настроены — используем статические данные')
      setError(null)
      return
    }

    const fetchVideos = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(
          `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&key=${apiKey}&maxResults=50`
        )
        if (!res.ok) {
          throw new Error(`Ошибка YouTube API: ${res.status}`)
        }
        const data = await res.json()

        const items: YouTubePlaylistItem[] = data.items.map((item: any) => {
          const title = item.snippet.title
          // Определяем тип видео по названию или описанию (пример логики)
          let type: 'cover' | 'live' | 'shorts' = 'cover'
          if (title.toLowerCase().includes('live') || title.toLowerCase().includes('концерт')) {
            type = 'live'
          } else if (title.toLowerCase().includes('short') || title.toLowerCase().includes('шортс')) {
            type = 'shorts'
          }

          return {
            id: item.id,
            title,
            youtubeId: item.snippet.resourceId.videoId,
            type,
            thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
          }
        })

        setVideos(items)
      } catch (err) {
        console.error('Ошибка загрузки YouTube:', err)
        setError('Не удалось загрузить видео из YouTube')
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
  }, [])

  return { videos, loading, error }
}
