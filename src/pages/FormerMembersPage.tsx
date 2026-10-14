import { Link } from 'react-router-dom'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useMeta } from '../hooks/useMeta'
import { useMembers } from '../hooks/useMembers'
import { toUiMember } from '../types'
import MemberCard from '../components/MemberCard'
import { UserX, ArrowLeft } from 'lucide-react'

export default function FormerMembersPage() {
  useDocumentTitle('Бывшие участники')
  useMeta({
    title: 'Бывшие участники FirePhoenix',
    description:
      'Те, кто когда-то был частью команды FirePhoenix — благодарность и память.',
  })
  const { members, loading } = useMembers({ status: 'former' })

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center text-muted">
        Загрузка...
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      <Link
        to="/team"
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-accent transition-colors"
      >
        <ArrowLeft size={14} /> К действующему составу
      </Link>

      <div className="reveal reveal-1 mt-8">
        <span className="tag">
          <UserX size={12} /> Бывшие участники
        </span>
      </div>
      <h1 className="reveal reveal-2 mt-7 font-display text-5xl sm:text-7xl lg:text-8xl leading-[1.35]">
        Те, кто был <span className="text-fire">с нами</span>
      </h1>
      <p className="reveal reveal-3 mt-6 max-w-2xl text-lg text-muted">
        Мы благодарны каждому, кто внёс свой вклад в историю FirePhoenix.
        Их голоса, арты и переводы навсегда останутся в наших релизах.
      </p>

      {members.length > 0 ? (
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((m, i) => (
            <MemberCard key={m.id} member={toUiMember(m)} index={i} />
          ))}
        </div>
      ) : (
        <div className="mt-12 surface p-10 text-center text-muted">
          Пока никто не ушёл — и это здорово.
        </div>
      )}
    </div>
  )
}