import { Link } from 'react-router-dom'
import { MessageCircle, Send, Instagram, Youtube, Calendar, ChevronRight } from 'lucide-react'
import type { Member } from '../types'

const socialIcon = {
  vk: MessageCircle,
  telegram: Send,
  instagram: Instagram,
  youtube: Youtube,
}

/** Берём первый «словный» символ ника и делаем из него инициал для плейсхолдера. */
function getInitial(name: string): string {
  const first = name.trim().charAt(0).toUpperCase()
  return first || '?'
}

interface Props {
  member: Member
  index?: number
}

export default function MemberCard({ member, index = 0 }: Props) {
  return (
    <article
      className="surface relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300 reveal"
      style={{ animationDelay: `${index * 0.06}s` }}
    >
      <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-fire opacity-30 blur-3xl group-hover:opacity-50 transition-opacity" />
      <div className="p-6 sm:p-7 relative">
        <div className="relative inline-block">
          <div
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden ring-2 ring-offset-4 ring-offset-elevated"
            style={{ boxShadow: '0 0 0 3px var(--accent-primary), 0 0 0 6px var(--bg-elevated)' }}
          >
            {member.avatar ? (
              <img
                src={member.avatar}
                alt={member.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-fire flex items-center justify-center text-white font-display text-3xl sm:text-4xl">
                {getInitial(member.name)}
              </div>
            )}
          </div>
        </div>
        <div className="mt-5">
          <div className="text-[10px] tracking-[0.3em] uppercase text-accent mb-1">
            {member.role}
          </div>
          <h3 className="font-display text-2xl leading-tight">{member.name}</h3>
          {member.bio && (
            <p className="mt-3 text-sm text-muted leading-relaxed line-clamp-3">
              {member.bio}
            </p>
          )}

          {member.tags.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-1.5">
              {member.tags.slice(0, 3).map((tag) => (
                <li
                  key={tag}
                  className="px-2 py-0.5 text-[10px] tracking-[0.2em] uppercase rounded-full bg-fireSoft text-accent"
                >
                  {tag}
                </li>
              ))}
            </ul>
          )}

          {member.birthDate && (
            <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted">
              <Calendar size={12} />
              <span>{member.birthDate}</span>
            </div>
          )}
        </div>
        <div className="mt-5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {Object.entries(member.socials).map(([key, url]) => {
              const Icon = socialIcon[key as keyof typeof socialIcon]
              if (!Icon || !url) return null
              return (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="w-9 h-9 rounded-xl border border-border flex items-center justify-center text-muted hover:text-accent hover:border-accent transition-colors"
                  aria-label={key}
                >
                  <Icon size={15} />
                </a>
              )
            })}
          </div>
          <Link
            to={`/team/${member.id}`}
            className="inline-flex items-center gap-1 text-xs tracking-[0.2em] uppercase text-accent opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all"
            aria-label={`Подробнее о ${member.name}`}
          >
            Подробнее
            <ChevronRight size={14} />
          </Link>
        </div>
        {/* Кликабельная зона — покрывает всю карточку, кроме соц. иконок */}
        <Link
          to={`/team/${member.id}`}
          aria-label={`Открыть карточку ${member.name}`}
          className="absolute inset-0 z-0"
        />
      </div>
    </article>
  )
}
