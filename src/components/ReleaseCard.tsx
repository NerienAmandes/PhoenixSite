import { Heart, Play, Calendar } from 'lucide-react'
import type { Release } from '../types'
import { formatDate } from '../utils/formatters'
import { useFavoritesStore } from '../store/useFavoritesStore'

interface Props {
  release: Release
  index?: number
}

export default function ReleaseCard({ release, index = 0 }: Props) {
  const isFav = useFavoritesStore((s) => s.favorites.includes(release.id))
  const toggleFav = useFavoritesStore((s) => s.toggle)
  const upcoming = release.status === 'upcoming'

  return (
    <article
      className="surface group relative overflow-hidden hover:-translate-y-1 transition-transform duration-300 reveal"
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
      <div className="p-5">
        <div className="text-[10px] tracking-[0.3em] uppercase text-muted mb-1">
          {release.originalArtist}
        </div>
        <h3 className="font-display text-2xl leading-tight">{release.title}</h3>
        <div className="mt-3 text-xs text-muted">
          {upcoming ? 'Релиз' : 'Вышел'} · {formatDate(release.releaseDate)}
        </div>
      </div>
    </article>
  )
}
