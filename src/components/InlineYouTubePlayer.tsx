import { useState } from 'react'
import { Play, Youtube } from 'lucide-react'

interface InlineYouTubePlayerProps {
  youtubeId: string
  title: string
  thumbnail?: string
}

/**
 * Inline-плеер YouTube: до клика показывает превью с кнопкой play,
 * после клика — autoplay lite-embed прямо в карточке (без редиректа).
 * `lite-embed` — это облегчённый iframe от YouTube (без баннер-рекламы,
 * минимальный набор фич), но для нашего лендинга подходит идеально.
 */
export default function InlineYouTubePlayer({
  youtubeId,
  title,
  thumbnail,
}: InlineYouTubePlayerProps) {
  const [active, setActive] = useState(false)

  const cover = thumbnail || `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`

  if (active) {
    return (
      <div className="relative aspect-video bg-base overflow-hidden">
        <iframe
          // lite-embed: autoplay=1 + минимальный набор фич YouTube IFrame API.
          // Открывается строго из превью по клику — поисковики не считают это
          // автоматической загрузкой стороннего контента.
          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
          className="w-full h-full"
        />
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setActive(true)}
      aria-label={`Воспроизвести видео: ${title}`}
      className="relative aspect-video bg-base overflow-hidden w-full text-left group cursor-pointer"
    >
      <img
        src={cover}
        alt={title}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      <div className="absolute inset-0 flex items-center justify-center opacity-90 group-hover:opacity-100 transition-opacity">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-fire text-white flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform">
          <Play size={22} fill="currentColor" />
        </div>
      </div>
      <div className="absolute top-3 left-3">
        <span className="tag backdrop-blur-md bg-black/40 text-white border-white/20 text-[10px]">
          <Youtube size={10} />
          Кавер
        </span>
      </div>
    </button>
  )
}
