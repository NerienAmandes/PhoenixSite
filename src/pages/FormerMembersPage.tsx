import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { supabase, publicUrl } from '../lib/supabase'
import MemberCard from '../components/MemberCard'
import { UserX, ArrowLeft } from 'lucide-react'

type DbMember = {
  id: string
  slug: string
  display_name: string
  role: string | null
  tags: string[]
  birth_mmdd: string | null
  bio: string | null
  avatar_path: string | null
  socials: Record<string, string>
  member_status: 'active' | 'former' | 'hidden'
}

export default function FormerMembersPage() {
  useDocumentTitle('Бывшие участники')
  const [members, setMembers] = useState<DbMember[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('member_status', 'former')
        .order('display_name', { ascending: true })

      if (!error) setMembers(data || [])
      setLoading(false)
    }
    load()
  }, [])

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
            <MemberCard
              key={m.id}
              member={{
                id: m.slug,
                name: m.display_name,
                role: m.role || undefined,
                tags: m.tags,
                birthDate: m.birth_mmdd || undefined,
                bio: m.bio ?? '',
                avatar: publicUrl(m.avatar_path) ?? '',
                socials: m.socials || {},
              }}
              index={i}
            />
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