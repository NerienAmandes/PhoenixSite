import { useState } from 'react'
import { portfolio as staticPortfolio } from '../data/portfolio'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useYouTubePlaylist } from '../hooks/useYouTubePlaylist'
import { Youtube, Play, Loader2 } from 'lucide-react'

type PortfolioFilter = 'all' | 'cover'

export default function ReleasesPage() {
  useDocumentTitle('Видео')
  const [pfFilter, setPfFilter] = useState<PortfolioFilter>('all')
  const { videos: ytVideos, loading: ytLoading, error: ytError } = useYouTubePlaylist()

  // Используем YouTube данные, если они есть, иначе статические
  const portfolio = ytVideos.length > 0 ? ytVideos.map(vid => ({
    id: vid.id,
    title: vid.title,
    type: 'cover' as const,
    youtubeId: vid.youtubeId
  })) : staticPortfolio

  const portfolioFiltered =
    pfFilter === 'all' ? portfolio : portfolio.filter((p) => p.type === pfFilter)

  const pfTabs: { id: PortfolioFilter; label: string }[] = [
    { id: 'all', label: 'Все' },
    { id: 'cover', label: 'Каверы' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      <div className="reveal reveal-1">
        <span className="tag"><Youtube size={12} /> Портфолио</span>
      </div>
      <h1 className="reveal reveal-2 mt-4 font-display text-5xl sm:text-7xl lg:text-8xl leading-[0.95]">
        Видео и <span className="text-fire">выступления</span>
      </h1>
      <p className="reveal reveal-3 mt-6 max-w-2xl text-lg text-muted">
        Студийные каверы, live-версии и закулисье — собрали всё, что
        показывает FirePhoenix в движении.
      </p>

      <div className="sticky top-24 z-20 -mx-4 sm:mx-0 px-4 sm:px-0 py-4 mt-10">
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
      </div>

      {ytLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={48} className="animate-spin text-fire" />
        </div>
      )}

      {ytError && (
        <div className="mt-4 text-red-500 text-sm">{ytError}</div>
      )}

      {!ytLoading && (
        <>
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
                      Кавер
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

          {portfolioFiltered.length === 0 && !ytError && (
            <div className="mt-12 text-center text-muted">В этой категории пока пусто.</div>
          )}
        </>
      )}


    </div>
  )
}
