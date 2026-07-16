import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import type { Member } from '../types'
import { MessageCircle, Send, Instagram, Youtube } from 'lucide-react'

const socialIcon = {
  vk: MessageCircle,
  telegram: Send,
  instagram: Instagram,
  youtube: Youtube,
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
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden ring-2 ring-offset-4 ring-offset-elevated"
            style={{ boxShadow: '0 0 0 3px var(--accent-primary), 0 0 0 6px var(--bg-elevated)' }}
          >
            <img
              src={member.avatar}
              alt={member.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
        <div className="mt-5">
          <div className="text-[10px] tracking-[0.3em] uppercase text-accent mb-1">
            {member.role}
          </div>
          <h3 className="font-display text-2xl leading-tight">{member.name}</h3>
          <p className="mt-3 text-sm text-muted leading-relaxed">{member.bio}</p>
        </div>
        <div className="mt-5 flex items-center gap-2">
          {Object.entries(member.socials).map(([key, url]) => {
            const Icon = socialIcon[key as keyof typeof socialIcon]
            if (!Icon || !url) return null
            return (
              <a
                key={key}
                href={url}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl border border-border flex items-center justify-center text-muted hover:text-accent hover:border-accent transition-colors"
                aria-label={key}
              >
                <Icon size={15} />
              </a>
            )
          })}
          <Link
            to="/join"
            className="ml-auto inline-flex items-center gap-1 text-xs tracking-[0.2em] uppercase text-accent hover:underline"
          >
            Пригласить <ArrowUpRight size={12} />
          </Link>
        </div>
      </div>
    </article>
  )
}
