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
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&key=${apiKey}&maxResults=50`
    )

    if (!ytRes.ok) {
      const errData = await ytRes.json().catch(() => null)
      return res.status(ytRes.status).json({
        error: errData?.error?.message || `YouTube API error: ${ytRes.status}`
      })
    }

    const data = await ytRes.json()

    const items = (data.items || []).map((item: any) => ({
      id: item.id,
      title: item.snippet.title,
      youtubeId: item.snippet.resourceId.videoId,
      thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
    }))

    return res.status(200).json({ items })
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Unknown error' })
  }
}
