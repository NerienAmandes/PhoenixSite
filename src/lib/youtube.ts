/**
 * Утилиты для работы с YouTube.
 *
 * - extractVideoId: вытаскивает ID видео из любых форматов YouTube-ссылок
 *   (watch?v=, youtu.be/, /embed/, /shorts/, или просто голый 11-символьный ID).
 * - thumbnailUrl: прямая ссылка на превью нужного качества
 *   (img.youtube.com отдаёт JPG без ключей, CORS открыт).
 * - fetchMeta: идёт в публичный YouTube oEmbed
 *   (https://www.youtube.com/oembed) и возвращает title + channelName.
 *   Без API-ключей, без регистрации, лимит — generous.
 *
 * Если что-то пошло не так — бросаем Error с понятным текстом, чтобы
 * форма могла показать его пользователю в surface-soft.
 */

const VIDEO_ID_RE = /^[a-zA-Z0-9_-]{11}$/
const VIDEO_ID_FROM_URL_RE =
  /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/

/** Извлечь ID видео (11 символов) из любой YouTube-ссылки. */
export function extractVideoId(url: string): string | null {
  if (!url) return null
  const trimmed = url.trim()
  if (VIDEO_ID_RE.test(trimmed)) return trimmed
  const m = trimmed.match(VIDEO_ID_FROM_URL_RE)
  return m ? m[1] : null
}

export type ThumbnailQuality = 'max' | 'high' | 'medium' | 'standard'

/** Прямая ссылка на превью YouTube-видео. */
export function thumbnailUrl(videoId: string, quality: ThumbnailQuality = 'max'): string {
  const name =
    quality === 'max'
      ? 'maxresdefault'
      : quality === 'high'
        ? 'hqdefault'
        : quality === 'medium'
          ? 'mqdefault'
          : 'sddefault'
  return `https://img.youtube.com/vi/${videoId}/${name}.jpg`
}

export type YouTubeMeta = {
  videoId: string
  title: string
  channelName: string
  channelUrl: string
  thumbnailUrl: string
}

/**
 * Достать метаданные видео через публичный YouTube oEmbed.
 * Не требует API-ключа. Возвращает title и channelName канала,
 * на котором лежит видео (НЕ оригинального исполнителя кавера).
 */
export async function fetchYouTubeMeta(url: string): Promise<YouTubeMeta> {
  const videoId = extractVideoId(url)
  if (!videoId) {
    throw new Error('Не похоже на YouTube-ссылку. Ожидаю watch?v=, youtu.be/, /embed/ или /shorts/.')
  }

  const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(
    `https://www.youtube.com/watch?v=${videoId}`,
  )}&format=json`

  let res: Response
  try {
    res = await fetch(oembedUrl)
  } catch (e) {
    throw new Error('Не удалось обратиться к YouTube. Проверь интернет и CORS.')
  }

  if (!res.ok) {
    if (res.status === 401 || res.status === 403 || res.status === 404) {
      throw new Error('YouTube не отдал метаданные. Возможно, видео приватное или удалено.')
    }
    throw new Error(`YouTube oEmbed вернул ${res.status}`)
  }

  const data: {
    title?: string
    author_name?: string
    author_url?: string
  } = await res.json()

  return {
    videoId,
    title: data.title ?? '',
    channelName: data.author_name ?? '',
    channelUrl: data.author_url ?? '',
    thumbnailUrl: thumbnailUrl(videoId, 'max'),
  }
}

/**
 * Попробовать вытащить имя оригинального исполнителя из заголовка видео.
 * Эвристика: если в title есть разделитель (" — ", " | ", " / ", " - "),
 * часть после него считаем оригинальным артебутом.
 *
 * Возвращает null, если уверенности нет — пусть пользователь введёт вручную.
 */
export function tryExtractOriginalArtist(title: string): string | null {
  if (!title) return null
  const separators = [' — ', ' – ', ' | ', ' / ', ' - ']
  for (const sep of separators) {
    const idx = title.indexOf(sep)
    if (idx > 0 && idx < title.length - sep.length) {
      const right = title.slice(idx + sep.length).trim()
      // отбрасываем очевидный мусор
      if (right && right.length <= 80 && !/[\[\(\{]/.test(right)) {
        return right
      }
    }
  }
  return null
}