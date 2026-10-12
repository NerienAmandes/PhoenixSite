import { useEffect, useState } from 'react'
import { MEMBER_CATEGORIES, getMemberCategories } from '../types'
import type { MemberCategory } from '../types'
import MemberCard from '../components/MemberCard'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { Users, UserX } from 'lucide-react'
import { supabase } from '../lib/supabase'

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
  is_published: boolean
  member_status: 'active' | 'former' | 'hidden'
}

export default function TeamPage() {
  useDocumentTitle('Состав')
  const [members, setMembers] = useState<DbMember[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMembers() {
      // Загружаем активных и бывших (hidden не показываем)
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .in('member_status', ['active', 'former'])
        .order('display_name', { ascending: true })

      if (error) {
        console.error('Ошибка загрузки участников:', error)
        setMembers([])
      } else {
        setMembers(data || [])
      }
      setLoading(false)
    }

    fetchMembers()
  }, [])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center text-muted">
        Загрузка состава...
      </div>
    )
  }

  // Разделяем на активных и бывших
  const activeMembers = members.filter(m => m.member_status === 'active')
  const formerMembers = members.filter(m => m.member_status === 'former')

  // Группировка активных по категориям
  const grouped: Record<MemberCategory, DbMember[]> = {
    vocals: [],
    sound: [],
    art: [],
    video: [],
    translators: [],
    admin: [],
  }
  for (const m of activeMembers) {
    for (const cat of getMemberCategories(m.tags)) {
      grouped[cat].push(m)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      <div className="reveal reveal-1">
        <span className="tag"><Users size={12} /> Состав</span>
      </div>
      <h1 className="reveal reveal-2 mt-7 font-display text-5xl sm:text-7xl lg:text-8xl leading-[1.35]">
        Семь сердец,
        <br />
        <span className="text-fire">один огонь</span>
      </h1>
      <p className="reveal reveal-3 mt-6 max-w-2xl text-lg text-muted">
        Каждый — самостоятельный музыкант со своей историей. Вместе мы
        превращаем любимые треки в истории, которые звучат на русском.
      </p>

      {/* Активные участники */}
      <div className="mt-14 space-y-16">
        {MEMBER_CATEGORIES.map(({ id, label }) => {
          const list = grouped[id]
          return (
            <section key={id} className="reveal">
              <div className="flex items-baseline gap-3">
                <h2 className="font-display text-3xl sm:text-4xl leading-[1.35]">
                  {label}
                </h2>
                <span className="text-[10px] tracking-[0.3em] uppercase text-muted">
                  {list.length}
                </span>
              </div>
              {list.length > 0 ? (
                <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {list.map((m, i) => (
                    <MemberCard
                      key={`${id}-${m.id}`}
                      member={{
                        id: m.slug,
                        name: m.display_name,
                        role: m.role || undefined,
                        tags: m.tags,
                        birthDate: m.birth_mmdd || undefined,
                        bio: m.bio ?? '',
                        avatar: m.avatar_path ?? '',
                        socials: m.socials || {},
                      }}
                      index={i}
                    />
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-muted">
                  Пока никого — открой вакансию, чтобы заполнить отдел.
                </p>
              )}
            </section>
          )
        })}
      </div>

      {/* Бывшие участники */}
      {formerMembers.length > 0 && (
        <section className="mt-20 pt-12 border-t border-border/30">
          <div className="reveal">
            <span className="tag"><UserX size={12} /> Бывшие участники</span>
          </div>
          <h2 className="reveal mt-7 font-display text-3xl sm:text-4xl leading-[1.35]">
            Те, кто был с нами
          </h2>
          <p className="reveal mt-4 max-w-2xl text-lg text-muted">
            Мы благодарны каждому, кто внёс свой вклад в историю FirePhoenix.
          </p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {formerMembers.map((m, i) => (
              <MemberCard
                key={`former-${m.id}`}
                member={{
                  id: m.slug,
                  name: m.display_name,
                  role: m.role || undefined,
                  tags: m.tags,
                  birthDate: m.birth_mmdd || undefined,
                  bio: m.bio ?? '',
                  avatar: m.avatar_path ?? '',
                  socials: m.socials || {},
                }}
                index={i}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}