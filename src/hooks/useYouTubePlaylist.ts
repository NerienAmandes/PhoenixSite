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
    const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY
    const playlistId = import.meta.env.VITE_YOUTUBE_PLAYLIST_ID

    console.log('[YouTube Debug] API Key:', apiKey ? `установлен (${apiKey.length} символов)` : 'НЕ НАЙДЕН')
    console.log('[YouTube Debug] Playlist ID:', playlistId ? `установлен (${playlistId})` : 'НЕ НАЙДЕН')

    if (!apiKey || !playlistId) {
      const missing = []
      if (!apiKey) missing.push('VITE_YOUTUBE_API_KEY')
      if (!playlistId) missing.push('VITE_YOUTUBE_PLAYLIST_ID')
      const msg = `Не заданы переменные окружения: ${missing.join(', ')}. Проверьте Vercel → Settings → Environment Variables и сделайте Redeploy.`
      console.warn(msg)
      setError(msg)
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
          const errData = await res.json().catch(() => null)
          const errMsg = `YouTube API ${res.status}: ${errData?.error?.message || res.statusText}`
          console.error('YouTube API вернул ошибку:', errMsg, errData)
          setError(errMsg)
          throw new Error(errMsg)
        }
        const data = await res.json()

        if (!data.items || data.items.length === 0) {
          console.warn('YouTube плейлист пуст — используем статические данные')
          throw new Error('Плейлист пуст')
        }

        const items: YouTubePlaylistItem[] = data.items.map((item: any) => {
          return {
            id: item.id,
            title: item.snippet.title,
            youtubeId: item.snippet.resourceId.videoId,
            type: 'cover' as const,
            thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
          }
        })

        setVideos(items)
      } catch (err) {
        console.warn('Не удалось загрузить YouTube, используем статические данные:', err)
        // НЕ показываем ошибку — лучше упасть на статические данные
        setError(null)
        setVideos([])
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
  }, [])

  return { videos, loading, error }
}
