import { useEffect, useMemo, useState } from 'react'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useMeta } from '../hooks/useMeta'
import { useYouTubePlaylist } from '../hooks/useYouTubePlaylist'
import { useReleases } from '../hooks/useReleases'
import { supabase } from '../lib/supabase'
import { Youtube, Loader2, Sparkles, X, Disc3 } from 'lucide-react'
import ReleaseCard from '../components/ReleaseCard'
import ReleaseFilters from '../components/ReleaseFilters'
import NotifySubscribeBanner from '../components/NotifySubscribeBanner'
import InlineYouTubePlayer from '../components/InlineYouTubePlayer'
import type { Release } from '../types'

type Tab = 'covers' | 'upcoming' | 'released'

type MemberLite = { slug: string; display_name: string }

export default function ReleasesPage() {
  useDocumentTitle('Релизы')
  useMeta({
    title: 'Релизы FirePhoenix',
    description:
      'Каверы FirePhoenix на русском: вышедшие и предстоящие релизы с прогрессом производства.',
  })
  const [tab, setTab] = useState<Tab>('upcoming')
  const [selectedVideo, setSelectedVideo] = useState<{
    id: string
    title: string
    youtubeId: string
  } | null>(null)

  const { videos: ytVideos, loading: ytLoading, error: ytError } = useYouTubePlaylist()
  const { releases: dbReleases, loading: releasesLoading } = useReleases()

  // Для фильтра по участникам — подтягиваем активных участников.
  const [members, setMembers] = useState<MemberLite[]>([])
  useEffect(() => {
    let cancelled = false
    void (async () => {
      const { data } = await supabase
        .from('members')
        .select('slug, display_name')
        .eq('member_status', 'active')
        .order('display_name')
      if (!cancelled && data) {
        setMembers(
          (data as MemberLite[]).map((m) => ({
            slug: m.slug,
            display_name: m.display_name,
          })),
        )
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const portfolio =
    ytVideos.length > 0
      ? ytVideos.map((vid) => ({
        id: vid.id,
        title: vid.title,
        youtubeId: vid.youtubeId,
      }))
      : []

  const tabs: { id: Tab; label: string; icon?: any }[] = [
    { id: 'upcoming', label: 'Предстоящие', icon: Sparkles },
    { id: 'released', label: 'Вышедшие', icon: Disc3 },
    { id: 'covers', label: 'Каверы', icon: Youtube },
  ]

  const allUpcoming = dbReleases.filter((r) => r.status === 'upcoming')
  const allReleased = dbReleases.filter((r) => r.status === 'released')

  // Список, отфильтрованный по выбранным фильтрам. Храним отдельно для
  // каждой вкладки — фильтр применяется к обеим, но при переключении таба
  // состояние сохраняется.
  const [filteredUpcoming, setFilteredUpcoming] = useState<Release[]>(allUpcoming)
  const [filteredReleased, setFilteredReleased] = useState<Release[]>(allReleased)

  // Актуальные списки для фильтра — мержим оба массива, чтобы фильтр показывал
  // участников и языки из обоих табов (юзер может переключиться, не теряя выбор).
  const filterSource = useMemo<Release[]>(
    () => [...allUpcoming, ...allReleased],
    [allUpcoming, allReleased],
  )

  // При смене списков (новые данные) — сбрасываем фильтр в «все».
  useEffect(() => {
    setFilteredUpcoming(allUpcoming)
    setFilteredReleased(allReleased)
  }, [allUpcoming, allReleased])

  const memberOptions = useMemo(
    () => members.map((m) => ({ slug: m.slug, name: m.display_name })),
    [members],
  )

  const handleFiltered = (list: Release[]) => {
    // Применяем отфильтрованный список к обеим вкладкам, если таба выгодна.
    // Фильтр «прогоняет» через оба массива.
    setFilteredUpcoming(list.filter((r) => r.status === 'upcoming'))
    setFilteredReleased(list.filter((r) => r.status === 'released'))
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      <div className="reveal reveal-1">
        <span className="tag"><Disc3 size={12} /> Релизы</span>
      </div>
      <h1 className="reveal reveal-2 mt-7 font-display text-5xl sm:text-7xl lg:text-8xl leading-[1.35]">
        Музыка <span className="text-fire">FirePhoenix</span>
      </h1>
      <p className="reveal reveal-3 mt-6 max-w-2xl text-lg text-muted">
        Грядущие каверы, уже вышедшие релизы и студийные видео — всё, что
        создаёт команда.
      </p>

      <div className="mt-8">
        <NotifySubscribeBanner />
      </div>

      <div className="sticky top-24 z-20 -mx-4 sm:mx-0 px-4 sm:px-0 py-4 mt-10">
        <div className="surface p-1.5 inline-flex flex-wrap gap-1 mb-8 backdrop-blur">
          {tabs.map((t) => {
            const active = tab === t.id
            const Icon = t.icon
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-5 py-2.5 rounded-xl text-sm tracking-wide transition-all inline-flex items-center gap-2 ${active
                    ? 'bg-fire text-white shadow-glow'
                    : 'text-muted hover:text-ink'
                  }`}
              >
                {Icon && <Icon size={14} />}
                {t.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Панель фильтров — показываем только для табов с релизами БД,
          для «Каверов» (YouTube-плейлист) фильтры бессмысленны. */}
      {tab !== 'covers' && (
        <ReleaseFilters
          releases={filterSource}
          members={memberOptions}
          onFiltered={handleFiltered}
        />
      )}

      {/* Вкладка: Каверы (YouTube) */}
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
              <span className="text-xs opacity-70">
                Проверьте, что API ключ включён и плейлист публичный.
              </span>
            </div>
          )}

          {!ytLoading && (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {portfolio.map((p, i) => (
                  <div
                    key={p.id}
                    className="group block surface overflow-hidden reveal hover:border-accent transition-colors cursor-pointer"
                    style={{ animationDelay: `${i * 0.05}s` }}
                    onClick={() => setSelectedVideo(p)}
                  >
                    <InlineYouTubePlayer
                      youtubeId={p.youtubeId}
                      title={p.title}
                    />
                    <div className="p-5">
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
                <div className="mt-12 text-center text-muted">
                  Каверы загружаются через YouTube API. Если здесь пусто,
                  проверьте настройки API.
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Вкладка: Предстоящие */}
      {tab === 'upcoming' && (
        <>
          <div className="surface-soft p-5 sm:p-6 mb-8 text-sm sm:text-base text-muted flex items-start gap-3">
            <Sparkles size={18} className="text-accent shrink-0 mt-0.5" />
            <span>
              Здесь анонсы грядущих каверов. Названия, даты и платформы
              обновляются через админку.
            </span>
          </div>

          {releasesLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={48} className="animate-spin text-fire" />
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredUpcoming.map((r, i) => (
                <ReleaseCard key={r.id} release={r} index={i} />
              ))}
            </div>
          )}

          {!releasesLoading && filteredUpcoming.length === 0 && (
            <div className="mt-12 text-center text-muted">
              {allUpcoming.length === 0
                ? 'Пока нет анонсированных релизов.'
                : 'Под выбранные фильтры ничего не нашлось. Попробуй сбросить.'}
            </div>
          )}
        </>
      )}

      {/* Вкладка: Вышедшие */}
      {tab === 'released' && (
        <>
          {releasesLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={48} className="animate-spin text-fire" />
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredReleased.map((r, i) => (
                <ReleaseCard key={r.id} release={r} index={i} />
              ))}
            </div>
          )}

          {!releasesLoading && filteredReleased.length === 0 && (
            <div className="mt-12 text-center text-muted">
              {allReleased.length === 0
                ? 'Вышедших релизов пока нет. Загляни позже — здесь появятся каверы, которые уже можно послушать.'
                : 'Под выбранные фильтры ничего не нашлось. Попробуй сбросить.'}
            </div>
          )}
        </>
      )}

      {/* Модальное окно с плеером */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm transition-opacity">
          <div className="relative w-full max-w-4xl bg-base rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex flex-col max-h-full">
            <button
              onClick={() => setSelectedVideo(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors backdrop-blur-md"
              aria-label="Закрыть"
            >
              <X size={24} />
            </button>
            <div className="aspect-video w-full bg-black shrink-0">
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?autoplay=1&rel=0&modestbranding=1&playsinline=1&controls=1`}
                title={selectedVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>
            <div className="p-4 sm:p-5 bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-4 overflow-y-auto">
              <h3 className="font-display text-xl sm:text-2xl leading-tight">
                {selectedVideo.title}
              </h3>
              <a
                href={`https://youtube.com/watch?v=${selectedVideo.youtubeId}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-ghost shrink-0 border border-white/10 text-sm py-2 px-4"
              >
                <Youtube size={16} /> На YouTube
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}