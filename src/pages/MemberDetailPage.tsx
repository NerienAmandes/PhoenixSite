import { useEffect, useState } from 'react'
import { Link, useParams, Navigate } from 'react-router-dom'
import {
  ArrowLeft,
  Calendar,
  MessageCircle,
  Send,
  Instagram,
  Youtube,
  Play,
  Music,
} from 'lucide-react'
import { supabase, publicUrl } from '../lib/supabase'
import { getMemberCategories } from '../types'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useMeta } from '../hooks/useMeta'
import { formatDate } from '../utils/formatters'

const socialIcon = {
  vk: MessageCircle,
  telegram: Send,
  instagram: Instagram,
  youtube: Youtube,
}

function getInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || '?'
}

// Типы для данных, которые мы получим из БД
type DbMember = {
  id: string
  slug: string
  display_name: string
  role: string | null
  tags: string[]
  birth_mmdd: string | null
  bio: string | null
  avatar_path: string | null
  socials: Record<string, string> | null
}

type DbRelease = {
  id: string
  slug: string
  title: string
  original_artist: string | null
  cover_url: string | null
  release_date: string | null
  status: 'upcoming' | 'released'
  platforms: Record<string, string> | null
}

export default function MemberDetailPage() {
  const { memberId } = useParams<{ memberId: string }>() // memberId здесь это slug
  const [member, setMember] = useState<DbMember | null>(null)
  const [releases, setReleases] = useState<DbRelease[]>([])
  const [loading, setLoading] = useState(true)

  useDocumentTitle(member ? member.display_name : 'Участник')
  useMeta({
    title: member ? `${member.display_name} — участник FirePhoenix` : 'Участник FirePhoenix',
    description:
      member?.bio?.slice(0, 160) ??
      'Профиль участника команды FirePhoenix на официальном сайте.',
    image: member?.avatar_path ? publicUrl(member.avatar_path) ?? undefined : undefined,
    type: 'article',
  })

  useEffect(() => {
    async function loadData() {
      if (!memberId) return

      // 1. Ищем участника по slug
      const { data: memberData, error: memberError } = await supabase
        .from('members')
        .select('*')
        .eq('slug', memberId)
        .single()

      if (memberError || !memberData) {
        setLoading(false)
        return // Если не найден, сработает Navigate ниже
      }

      // 2. Ищем релизы, где участвовал этот участник
      const { data: creditsData, error: creditsError } = await supabase
        .from('release_credits')
        .select(`
          release_id,
          releases (
            id,
            slug,
            title,
            original_artist,
            cover_url,
            release_date,
            status,
            platforms
          )
        `)
        .eq('member_id', memberData.id)

      setMember(memberData)

      // Извлекаем массив релизов из ответа и фильтруем null
      const fetchedReleases = (creditsData || [])
        .map((c: any) => c.releases)
        .filter(Boolean) as DbRelease[]

      // Сортируем по дате (новые сверху)
      fetchedReleases.sort((a, b) => {
        if (!a.release_date) return 1
        if (!b.release_date) return -1
        return new Date(b.release_date).getTime() - new Date(a.release_date).getTime()
      })

      setReleases(fetchedReleases)
      setLoading(false)
    }

    loadData()
  }, [memberId])

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center text-muted">
        Загрузка...
      </div>
    )
  }

  if (!member) {
    return <Navigate to="/team" replace />
  }

  const categories = getMemberCategories(member.tags)
  const categoryLabels: Record<string, string> = {
    vocals: 'Вокалист',
    sound: 'Звукарь',
    art: 'Художник',
    video: 'Монтажёр',
    translators: 'Переводчик',
    admin: 'Админ',
  }

  const avatarUrl = publicUrl(member.avatar_path)
  const socials = member.socials || {}

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <Link
        to="/team"
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-accent transition-colors"
      >
        <ArrowLeft size={16} /> Назад к составу
      </Link>

      {/* Hero */}
      <section className="mt-8 grid lg:grid-cols-[280px_1fr] gap-8 lg:gap-12 items-start">
        <div className="reveal reveal-1 relative">
          <div
            className="aspect-square w-full max-w-[280px] mx-auto lg:mx-0 rounded-[32px] overflow-hidden relative bg-deep"
            style={{
              boxShadow:
                '0 30px 80px -40px var(--accent-primary), 0 0 0 1px var(--border-soft) inset',
            }}
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={member.display_name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                  const fallback = target.nextElementSibling as HTMLElement
                  if (fallback) fallback.style.display = 'flex'
                }}
              />
            ) : null}
            <div
              className="w-full h-full bg-fire flex items-center justify-center text-white font-display text-7xl"
              style={{ display: avatarUrl ? 'none' : 'flex' }}
            >
              {getInitial(member.display_name)}
            </div>
          </div>
          <div className="flame-blob w-48 h-48 -bottom-12 -right-12 bg-fire" />
        </div>

        <div className="reveal reveal-2">
          <div className="text-[10px] tracking-[0.3em] uppercase text-accent">
            {member.role}
          </div>
          <h1 className="mt-3 font-display text-5xl sm:text-7xl leading-[1.35]">
            {member.display_name}
          </h1>

          {member.bio && (
            <div className="mt-6 text-lg sm:text-xl text-ink-2 leading-relaxed max-w-2xl space-y-4">
              {member.bio
                .split(/\n\s*\n/)
                .map((p) => p.trim())
                .filter(Boolean)
                .map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
            </div>
          )}

          <div className="mt-7 flex flex-wrap items-center gap-2">
            {member.tags.map((tag) => (
              <span key={tag} className="tag">
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-5">
            {member.birth_mmdd && (
              <div className="inline-flex items-center gap-2 text-sm text-muted">
                <Calendar size={16} />
                <span>День рождения: {member.birth_mmdd}</span>
              </div>
            )}
            <div className="inline-flex items-center gap-2 text-sm text-muted">
              <Music size={16} />
              <span>
                {releases.length}{' '}
                {releases.length === 1
                  ? 'релиз'
                  : releases.length >= 2 && releases.length <= 4
                    ? 'релиза'
                    : 'релизов'}
              </span>
            </div>
          </div>

          {Object.keys(socials).length > 0 && (
            <div className="mt-7 flex items-center gap-2">
              {Object.entries(socials).map(([key, url]) => {
                const Icon = socialIcon[key as keyof typeof socialIcon]
                if (!Icon || !url) return null
                return (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-outline btn-icon"
                    aria-label={key}
                  >
                    <Icon size={16} />
                  </a>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Роли в команде */}
      {categories.length > 0 && (
        <section className="mt-14 reveal reveal-3">
          <h2 className="font-display text-3xl sm:text-4xl leading-[1.35]">
            Чем <span className="text-fire">занимается</span> в команде
          </h2>
          <div className="mt-6 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <span
                key={cat}
                className="px-4 py-2 rounded-2xl surface-soft text-sm"
              >
                {categoryLabels[cat]}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Список релизов */}
      <section className="mt-14 reveal reveal-4">
        <div className="flex items-baseline gap-3">
          <h2 className="font-display text-3xl sm:text-4xl leading-[1.35]">
            Релизы с <span className="text-fire">участием</span>
          </h2>
          <span className="text-[10px] tracking-[0.3em] uppercase text-muted">
            {releases.length}
          </span>
        </div>

        {releases.length === 0 ? (
          <p className="mt-6 text-muted">
            Пока нет релизов с этим участником. Загляни позже.
          </p>
        ) : (
          <div className="mt-7 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {releases.map((r, i) => {
              const youtube = r.platforms?.youtube
              const isUpcoming = r.status === 'upcoming'
              const coverUrl = publicUrl(r.cover_url)

              return (
                <article
                  key={r.id}
                  className="surface group relative overflow-hidden reveal hover:-translate-y-1 transition-transform duration-300 flex flex-col"
                  style={{ animationDelay: `${i * 0.06}s` }}
                >
                  <div className="aspect-square relative overflow-hidden bg-deep">
                    {coverUrl ? (
                      <img
                        src={coverUrl}
                        alt={r.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                        }}
                      />
                    ) : null}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                    <div className="absolute top-3 left-3">
                      {isUpcoming ? (
                        <span className="tag bg-fire text-white border-transparent">
                          Скоро
                        </span>
                      ) : (
                        <span className="tag">Вышел</span>
                      )}
                    </div>
                    {youtube && (
                      <a
                        href={youtube}
                        target="_blank"
                        rel="noreferrer"
                        className="absolute bottom-3 right-3 inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/95 text-black text-xs uppercase tracking-widest font-medium opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all"
                      >
                        <Play size={12} fill="currentColor" /> YouTube
                      </a>
                    )}
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="text-[10px] tracking-[0.3em] uppercase text-muted mb-1">
                      {r.original_artist}
                    </div>
                    <h3 className="font-display text-xl leading-tight">
                      {r.title}
                    </h3>
                    <div className="mt-3 text-xs text-muted">
                      {isUpcoming ? 'Релиз' : 'Вышел'} ·{' '}
                      {r.release_date ? formatDate(r.release_date) : 'Дата не указана'}
                    </div>
                    {youtube && (
                      <a
                        href={youtube}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-4 inline-flex items-center gap-2 text-sm text-accent hover:opacity-80 transition-opacity"
                      >
                        <Youtube size={14} /> Смотреть на YouTube
                      </a>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}