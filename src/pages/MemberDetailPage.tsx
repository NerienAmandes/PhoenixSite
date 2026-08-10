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
import { members } from '../data/members'
import { getMemberCategories, type Member } from '../types'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { getMemberReleases } from '../utils/memberReleases'
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

interface Props {
  /** Можно прокинуть участника напрямую (используется в роуте через :memberId). */
  member: Member
}

function MemberDetailLayout({ member }: Props) {
  const memberReleases = getMemberReleases(member.id)
  const categories = getMemberCategories(member.tags)
  const categoryLabels: Record<string, string> = {
    vocals: 'Вокалист',
    sound: 'Звукарь',
    art: 'Художник',
    video: 'Монтажёр',
    translators: 'Переводчик',
    admin: 'Админ',
  }

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
            className="aspect-square w-full max-w-[280px] mx-auto lg:mx-0 rounded-[32px] overflow-hidden relative"
            style={{
              boxShadow:
                '0 30px 80px -40px var(--accent-primary), 0 0 0 1px var(--border-soft) inset',
            }}
          >
            {member.avatar ? (
              <img
                src={member.avatar}
                alt={member.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-fire flex items-center justify-center text-white font-display text-7xl">
                {getInitial(member.name)}
              </div>
            )}
          </div>
          <div className="flame-blob w-48 h-48 -bottom-12 -right-12 bg-fire" />
        </div>

        <div className="reveal reveal-2">
          <div className="text-[10px] tracking-[0.3em] uppercase text-accent">
            {member.role}
          </div>
          <h1 className="mt-3 font-display text-5xl sm:text-7xl leading-[1.35]">
            {member.name}
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
            {member.birthDate && (
              <div className="inline-flex items-center gap-2 text-sm text-muted">
                <Calendar size={16} />
                <span>День рождения: {member.birthDate}</span>
              </div>
            )}
            <div className="inline-flex items-center gap-2 text-sm text-muted">
              <Music size={16} />
              <span>
                {memberReleases.length}{' '}
                {memberReleases.length === 1
                  ? 'релиз'
                  : memberReleases.length >= 2 && memberReleases.length <= 4
                    ? 'релиза'
                    : 'релизов'}
              </span>
            </div>
          </div>

          {Object.keys(member.socials).length > 0 && (
            <div className="mt-7 flex items-center gap-2">
              {Object.entries(member.socials).map(([key, url]) => {
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
            {memberReleases.length}
          </span>
        </div>

        {memberReleases.length === 0 ? (
          <p className="mt-6 text-muted">
            Пока нет релизов с этим участником. Загляни позже.
          </p>
        ) : (
          <div className="mt-7 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {memberReleases.map((r, i) => {
              const youtube = r.platforms.youtube
              const isUpcoming = r.status === 'upcoming'
              return (
                <article
                  key={r.id}
                  className="surface group relative overflow-hidden reveal hover:-translate-y-1 transition-transform duration-300 flex flex-col"
                  style={{ animationDelay: `${i * 0.06}s` }}
                >
                  <div className="aspect-square relative overflow-hidden">
                    <img
                      src={r.cover}
                      alt={r.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                    />
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
                      {r.originalArtist}
                    </div>
                    <h3 className="font-display text-xl leading-tight">
                      {r.title}
                    </h3>
                    <div className="mt-3 text-xs text-muted">
                      {isUpcoming ? 'Релиз' : 'Вышел'} ·{' '}
                      {formatDate(r.releaseDate)}
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

export default function MemberDetailPage() {
  const { memberId } = useParams<{ memberId: string }>()
  const member = members.find((m) => m.id === memberId)

  useDocumentTitle(member ? member.name : 'Участник')

  if (!member) {
    return <Navigate to="/team" replace />
  }

  return <MemberDetailLayout member={member} />
}
