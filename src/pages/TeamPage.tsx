import { Link } from 'react-router-dom'
import { MEMBER_CATEGORIES, getMemberCategories, toUiMember } from '../types'
import type { MemberCategory } from '../types'
import MemberCard from '../components/MemberCard'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useMeta } from '../hooks/useMeta'
import { useMembers } from '../hooks/useMembers'
import { Users, UserX, ArrowUpRight } from 'lucide-react'

export default function TeamPage() {
  useDocumentTitle('Состав')
  useMeta({
    title: 'Состав FirePhoenix',
    description:
      'Вокалисты, звукари, художники и монтажёры FirePhoenix — все, кто делает каверы на русском.',
  })
  const { members, loading } = useMembers({ status: 'active' })

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center text-muted">
        Загрузка состава...
      </div>
    )
  }

  // Группировка активных по категориям
  const grouped: Record<MemberCategory, typeof members> = {
    vocals: [],
    sound: [],
    art: [],
    video: [],
    translators: [],
    admin: [],
  }
  for (const m of members) {
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
                      member={toUiMember(m)}
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

      {/* Ссылка на страницу бывших участников */}
      <section className="mt-20 pt-12 border-t border-border/30">
        <div className="reveal">
          <span className="tag">
            <UserX size={12} /> Бывшие участники
          </span>
        </div>
        <h2 className="reveal mt-7 font-display text-3xl sm:text-4xl leading-[1.35]">
          Те, кто был с нами
        </h2>
        <p className="reveal mt-4 max-w-2xl text-lg text-muted">
          Мы благодарны каждому, кто внёс свой вклад в историю FirePhoenix.
          У них теперь есть своё место на сайте.
        </p>
        <Link to="/team/former" className="btn btn-ghost mt-6">
          Открыть страницу бывших <ArrowUpRight size={14} />
        </Link>
      </section>
    </div>
  )
}