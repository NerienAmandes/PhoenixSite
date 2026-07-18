import { useState } from 'react'
import { portfolio as staticPortfolio } from '../data/portfolio'
import { upcomingReleases } from '../data/releases'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useYouTubePlaylist } from '../hooks/useYouTubePlaylist'
import { Youtube, Loader2, Sparkles, X } from 'lucide-react'
import ReleaseCard from '../components/ReleaseCard'
import InlineYouTubePlayer from '../components/InlineYouTubePlayer'

type Tab = 'covers' | 'upcoming'

export default function ReleasesPage() {
  useDocumentTitle('Видео')
  const [tab, setTab] = useState<Tab>('covers')
  const [selectedVideo, setSelectedVideo] = useState<{id: string, title: string, youtubeId: string} | null>(null)
  const { videos: ytVideos, loading: ytLoading, error: ytError } = useYouTubePlaylist()

  // Используем YouTube данные, если они есть, иначе статические
  const portfolio = ytVideos.length > 0
    ? ytVideos.map((vid) => ({
        id: vid.id,
        title: vid.title,
        youtubeId: vid.youtubeId,
      }))
    : staticPortfolio.map((p) => ({ id: p.id, title: p.title, youtubeId: p.youtubeId }))

  const tabs: { id: Tab; label: string }[] = [
    { id: 'covers', label: 'Каверы' },
    { id: 'upcoming', label: 'Предстоящие релизы' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      <div className="reveal reveal-1">
        <span className="tag"><Youtube size={12} /> Портфолио</span>
      </div>
      <h1 className="reveal reveal-2 mt-7 font-display text-5xl sm:text-7xl lg:text-8xl leading-[1.35]">
        Видео и <span className="text-fire">выступления</span>
      </h1>
      <p className="reveal reveal-3 mt-6 max-w-2xl text-lg text-muted">
        Студийные каверы, live-версии и закулисье — собрали всё, что
        показывает FirePhoenix в движении.
      </p>

      <div className="sticky top-24 z-20 -mx-4 sm:mx-0 px-4 sm:px-0 py-4 mt-10">
        <div className="surface p-1.5 inline-flex flex-wrap gap-1 mb-8 backdrop-blur">
          {tabs.map((t) => {
            const active = tab === t.id
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
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

      {tab === 'covers' && (
        <>
          {ytLoading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={48} className="animate-spin text-fire" />
            </div>
          )}

          {ytError && (
            <div className="mt-4 p-4 rounded-xl bg-red-100 border border-red-300 text-red-800 text-sm">
              <strong>Ошибка YouTube API:</strong> {ytError}
              <br />
              <span className="text-xs opacity-70">Проверьте, что API ключ включён и плейлист публичный.</span>
            </div>
          )}

          {!ytLoading && (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {portfolio.map((p, i) => (
                  <div
                    key={p.id}
                    className="group block surface overflow-hidden reveal hover:border-accent transition-colors"
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    <InlineYouTubePlayer
                      youtubeId={p.youtubeId}
                      title={p.title}
                    />
                    <div 
                      className="p-5 cursor-pointer"
                      onClick={() => setSelectedVideo(p)}
                    >
                      <div className="font-display text-2xl leading-tight group-hover:text-accent transition-colors">
                        {p.title}
                      </div>
                      <div className="mt-2 text-sm text-accent inline-flex items-center gap-1.5">
                        Смотреть во внутреннем плеере
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {portfolio.length === 0 && !ytError && (
                <div className="mt-12 text-center text-muted">В этой категории пока пусто.</div>
              )}
            </>
          )}
        </>
      )}

      {tab === 'upcoming' && (
        <>
          <div className="surface-soft p-5 sm:p-6 mb-8 text-sm sm:text-base text-muted flex items-start gap-3">
            <Sparkles size={18} className="text-accent shrink-0 mt-0.5" />
            <span>
              Здесь будут анонсы грядущих каверов. Названия, даты и платформы
              обновляются вручную.
            </span>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {upcomingReleases.map((r, i) => (
              <ReleaseCard key={r.id} release={r} index={i} />
            ))}
          </div>
        </>
      )}

      {/* Модальное окно с плеером */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity">
          <div className="relative w-full max-w-5xl bg-base rounded-2xl overflow-hidden shadow-2xl border border-white/10">
            <button 
              onClick={() => setSelectedVideo(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors backdrop-blur-md"
              aria-label="Закрыть"
            >
              <X size={24} />
            </button>
            <div className="aspect-video w-full bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                title={selectedVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>
            <div className="p-5 sm:p-6 bg-surface">
              <h3 className="font-display text-2xl sm:text-3xl leading-tight">
                {selectedVideo.title}
              </h3>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
