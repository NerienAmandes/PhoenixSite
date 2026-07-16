import { useState } from 'react'
import { releases } from '../data/releases'
import { portfolio } from '../data/portfolio'
import ReleaseCard from '../components/ReleaseCard'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { Disc3, Heart, Youtube, Play } from 'lucide-react'
import { useFavoritesStore } from '../store/useFavoritesStore'

type Filter = 'all' | 'upcoming' | 'released'
type PortfolioFilter = 'all' | 'cover' | 'live' | 'shorts'

export default function ReleasesPage() {
  useDocumentTitle('Релизы')
  const [filter, setFilter] = useState<Filter>('all')
  const [pfFilter, setPfFilter] = useState<PortfolioFilter>('all')
  const favorites = useFavoritesStore((s) => s.favorites)

  const filtered = releases.filter((r) =>
    filter === 'all' ? true : r.status === filter
  )

  const portfolioFiltered =
    pfFilter === 'all' ? portfolio : portfolio.filter((p) => p.type === pfFilter)

  const tabs: { id: Filter; label: string }[] = [
    { id: 'all', label: 'Все' },
    { id: 'upcoming', label: 'Скоро' },
    { id: 'released', label: 'Вышли' },
  ]

  const pfTabs: { id: PortfolioFilter; label: string }[] = [
    { id: 'all', label: 'Все' },
    { id: 'cover', label: 'Каверы' },
    { id: 'live', label: 'Live' },
    { id: 'shorts', label: 'Shorts' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      <div className="reveal reveal-1">
        <span className="tag"><Disc3 size={12} /> Релизы</span>
      </div>
      <h1 className="reveal reveal-2 mt-4 font-display text-5xl sm:text-7xl lg:text-8xl leading-[0.95]">
        Треки,
        <br />
        которые <span className="text-fire">звучат</span>
      </h1>
      <p className="reveal reveal-3 mt-6 max-w-2xl text-lg text-muted">
        Скоро — то, что мы готовим прямо сейчас. Вышли — те, что уже можно
        послушать на любимой площадке.
      </p>

      <div className="sticky top-20 z-20 -mx-4 sm:mx-0 px-4 sm:px-0 py-4 mt-10">
        <div className="surface p-1.5 inline-flex gap-1 backdrop-blur">
          {tabs.map((t) => {
            const active = filter === t.id
            return (
              <button
                key={t.id}
                onClick={() => setFilter(t.id)}
                className={`px-5 py-2.5 rounded-xl text-sm tracking-wide transition-all ${
                  active
                    ? 'bg-fire text-white shadow-glow'
                    : 'text-muted hover:text-ink'
                }`}
              >
                {t.label}
              </button>
            )
          })}
        </div>
      </div>

      {filter === 'all' && favorites.length > 0 && (
        <div className="mt-4 text-xs text-muted inline-flex items-center gap-2">
          <Heart size={12} className="text-accent" fill="currentColor" /> У вас {favorites.length}{' '}
          {favorites.length === 1 ? 'избранный трек' : 'избранных трека'}
        </div>
      )}

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((r, i) => (
          <ReleaseCard key={r.id} release={r} index={i} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="mt-12 text-center text-muted">В этой категории пока пусто.</div>
      )}

      <section className="mt-24 sm:mt-32">
        <div className="flex items-end justify-between flex-wrap gap-6 mb-8">
          <div>
            <div className="text-sm tracking-[0.3em] uppercase text-accent inline-flex items-center gap-2">
              <Youtube size={14} /> Портфолио
            </div>
            <h2 className="font-display text-4xl sm:text-6xl mt-2 leading-[0.95]">
              Видео и <span className="text-fire">выступления</span>
            </h2>
            <p className="mt-3 max-w-2xl text-lg text-muted">
              Студийные каверы, live-версии и закулисье — собрали всё, что
              показывает FirePhoenix в движении.
            </p>
          </div>
        </div>

        <div className="surface p-1.5 inline-flex flex-wrap gap-1 mb-8 backdrop-blur">
          {pfTabs.map((t) => {
            const active = pfFilter === t.id
            return (
              <button
                key={t.id}
                onClick={() => setPfFilter(t.id)}
                className={`px-5 py-2.5 rounded-xl text-sm tracking-wide transition-all ${
                  active
                    ? 'bg-fire text-white shadow-glow'
                    : 'text-muted hover:text-ink'
                }`}
              >
                {t.label}
              </button>
            )
          })}
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {portfolioFiltered.map((p, i) => (
            <a
              key={p.id}
              href={`https://www.youtube.com/watch?v=${p.youtubeId}`}
              target="_blank"
              rel="noreferrer"
              className="group block surface overflow-hidden reveal hover:border-accent transition-colors"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="relative aspect-video bg-base overflow-hidden">
                <img
                  src={`https://i.ytimg.com/vi/${p.youtubeId}/hqdefault.jpg`}
                  alt={p.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center opacity-90 group-hover:opacity-100 transition-opacity">
                  <div className="w-16 h-16 rounded-full bg-fire text-white flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform">
                    <Play size={26} fill="currentColor" />
                  </div>
                </div>
                <div className="absolute top-3 left-3">
                  <span className="tag backdrop-blur-md bg-black/40 text-white border-white/20 text-[10px]">
                    <Youtube size={10} />
                    {p.type === 'cover' && 'Кавер'}
                    {p.type === 'live' && 'Live'}
                    {p.type === 'shorts' && 'Shorts'}
                  </span>
                </div>
              </div>
              <div className="p-5">
                <div className="font-display text-2xl leading-tight group-hover:text-accent transition-colors">
                  {p.title}
                </div>
                <div className="mt-2 text-sm text-muted inline-flex items-center gap-1.5">
                  Смотреть на YouTube →
                </div>
              </div>
            </a>
          ))}
        </div>

        {portfolioFiltered.length === 0 && (
          <div className="mt-12 text-center text-muted">В этой категории пока пусто.</div>
        )}

        <div className="mt-10 surface-soft p-5 sm:p-6 text-base sm:text-lg text-muted leading-relaxed">
          <span className="text-ink font-medium">Совет:</span> чтобы заменить
          видео — открой{' '}
          <code className="text-accent font-mono text-sm sm:text-base">
            src/data/portfolio.ts
          </code>{' '}
          и подставь реальные ID своих роликов с YouTube (часть ссылки после
          <code className="text-accent font-mono"> ?v=</code>).
        </div>
      </section>
    </div>
  )
}
