import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const apiKey = process.env.YOUTUBE_API_KEY
  const playlistId = process.env.YOUTUBE_PLAYLIST_ID

  if (!apiKey || !playlistId) {
    return res.status(500).json({
      error: 'Server configuration error: YOUTUBE_API_KEY or YOUTUBE_PLAYLIST_ID not set'
    })
  }

  try {
    const ytRes = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,status&playlistId=${playlistId}&key=${apiKey}&maxResults=50`
    )

    if (!ytRes.ok) {
      const errData = await ytRes.json().catch(() => null)
      return res.status(ytRes.status).json({
        error: errData?.error?.message || `YouTube API error: ${ytRes.status}`
      })
    }

    const data = await ytRes.json()

    // Сортируем видео по дате публикации — новые сверху
    const sortedItems = (data.items || []).slice().sort((a: any, b: any) => {
      const dateA = new Date(a.snippet.publishedAt).getTime()
      const dateB = new Date(b.snippet.publishedAt).getTime()
      return dateB - dateA
    })

    // Фильтруем видео: оставляем только публичные, исключаем удаленные/приватные
    const visibleItems = sortedItems.filter((item: any) => {
      const title = String(item.snippet?.title ?? '')
      const privacyStatus = item.status?.privacyStatus
      
      // Исключаем системные заглушки YouTube для скрытых/удаленных видео
      if (title === 'Private video' || title === 'Deleted video') return false
      
      // Оставляем только публичные видео, если доступен статус приватности
      if (privacyStatus && privacyStatus !== 'public') return false
      
      return true
    })

    const items = visibleItems.map((item: any) => ({
      id: item.id,
      title: item.snippet.title,
      youtubeId: item.snippet.resourceId.videoId,
      publishedAt: item.snippet.publishedAt,
      thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
    }))

    return res.status(200).json({ items })
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Unknown error' })
  }
}
