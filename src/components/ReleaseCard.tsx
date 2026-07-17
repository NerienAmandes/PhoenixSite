import { Heart, Play, Calendar } from 'lucide-react'
import type { Release } from '../types'
import { formatDate } from '../utils/formatters'
import { useFavoritesStore } from '../store/useFavoritesStore'

const UPCOMING_STAGES = [
  'Текст готов',
  'Записывается вокал',
  'Вокал готов',
  'Этап тюнотайма',
  'Тюнотайм готов',
  'Сведение',
  'Сведение готово',
  'Арт (если требуется)',
  'Арт готов',
  'Монтаж видео',
  'Видео готово',
  'Предстоящая дата релиза',
]

interface Props {
  release: Release
  index?: number
}

export default function ReleaseCard({ release, index = 0 }: Props) {
  const isFav = useFavoritesStore((s) => s.favorites.includes(release.id))
  const toggleFav = useFavoritesStore((s) => s.toggle)
  const upcoming = release.status === 'upcoming'
  const currentStage = release.currentStage ?? 0
  const showTimeline = upcoming && release.currentStage !== undefined
  const percent = showTimeline
    ? Math.round((currentStage / (UPCOMING_STAGES.length - 1)) * 100)
    : 0

  return (
    <article
      className="surface group relative overflow-hidden hover:-translate-y-1 transition-transform duration-300 reveal flex flex-col"
      style={{ animationDelay: `${index * 0.06}s` }}
    >
      <div className="aspect-square relative overflow-hidden">
        <img
          src={release.cover}
          alt={release.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <button
          onClick={() => toggleFav(release.id)}
          className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${
            isFav
              ? 'bg-fire text-white'
              : 'bg-black/40 text-white hover:bg-fire'
          }`}
          aria-label={isFav ? 'Убрать из избранного' : 'В избранное'}
        >
          <Heart size={16} fill={isFav ? 'currentColor' : 'none'} />
        </button>
        <div className="absolute top-3 left-3">
          {upcoming ? (
            <span className="tag bg-fire text-white border-transparent">
              <Calendar size={12} /> Скоро
            </span>
          ) : (
            <span className="tag">Вышел</span>
          )}
        </div>
        <a
          href={release.platforms.youtube ?? release.platforms.spotify ?? '#'}
          target="_blank"
          rel="noreferrer"
          className="absolute bottom-3 right-3 inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/95 text-black text-xs uppercase tracking-widest font-medium opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all"
        >
          <Play size={12} fill="currentColor" /> Слушать
        </a>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <div className="text-[10px] tracking-[0.3em] uppercase text-muted mb-1">
          {release.originalArtist}
        </div>
        <h3 className="font-display text-2xl leading-tight">{release.title}</h3>
        <div className="mt-3 text-xs text-muted">
          {upcoming ? 'Релиз' : 'Вышел'} · {formatDate(release.releaseDate)}
        </div>

        {showTimeline && (
          <div className="mt-5 pt-5 border-t border-border">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[10px] tracking-[0.3em] uppercase text-muted">
                Прогресс
              </div>
              <div className="text-[10px] tracking-[0.2em] uppercase text-accent font-medium">
                {currentStage + 1} / {UPCOMING_STAGES.length} · {percent}%
              </div>
            </div>

            <div className="relative flex items-center">
              {UPCOMING_STAGES.map((stage, idx) => {
                const isDone = idx < currentStage
                const isCurrent = idx === currentStage
                const isLast = idx === UPCOMING_STAGES.length - 1
                const lineDone = idx < currentStage
                return (
                  <div key={idx} className="flex-1 flex items-center min-w-0">
                    <div className="relative shrink-0 group/dot">
                      <div
                        className={`rounded-full transition-all ${
                          isDone
                            ? 'w-2.5 h-2.5 bg-fire'
                            : isCurrent
                              ? 'w-3.5 h-3.5 bg-fire shadow-glow ring-2 ring-fire/30'
                              : 'w-2.5 h-2.5 bg-border'
                        }`}
                      />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded-md bg-base text-[10px] whitespace-nowrap opacity-0 group-hover/dot:opacity-100 transition-opacity pointer-events-none z-10 border border-border shadow-card">
                        <span className="text-muted mr-1">{idx + 1}.</span>
                        <span className="text-ink">{stage}</span>
                      </div>
                    </div>
                    {!isLast && (
                      <div
                        className={`flex-1 h-px -mx-0.5 ${
                          lineDone ? 'bg-fire' : 'bg-border'
                        }`}
                      />
                    )}
                  </div>
                )
              })}
            </div>

            <div className="mt-4 flex items-center gap-2 text-sm">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-fire shadow-glow shrink-0" />
              <span className="text-muted">Сейчас:</span>
              <span className="text-ink font-medium truncate">
                {UPCOMING_STAGES[currentStage]}
              </span>
            </div>
          </div>
        )}
      </div>
    </article>
  )
}
