import { Play, Youtube } from 'lucide-react'

interface InlineYouTubePlayerProps {
  youtubeId: string
  title: string
  thumbnail?: string
}

/**
 * Inline-плеер YouTube: визуальная карточка с превью и кнопкой Play.
 * Теперь является просто компонентом отображения (без внутреннего состояния iframe),
 * чтобы корректно работать с внешним модальным окном.
 */
export default function InlineYouTubePlayer({
  youtubeId,
  title,
  thumbnail,
}: InlineYouTubePlayerProps) {
  const cover = thumbnail || `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`

  return (
    <div
      aria-label={`Воспроизвести видео: ${title}`}
      className="relative aspect-video bg-base overflow-hidden w-full text-left group"
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
    </div>
  )
}
