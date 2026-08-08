import { members } from '../data/members'
import { MEMBER_CATEGORIES, getMemberCategories } from '../types'
import type { MemberCategory } from '../types'
import MemberCard from '../components/MemberCard'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { Users } from 'lucide-react'

/**
 * Сортируем участников по категориям. Один человек может попасть сразу
 * в несколько секций — это сделано намеренно, чтобы было видно, кто из
 * «админов» ещё и поёт, а кто из «художников» заодно монтирует.
 */
const grouped: Record<MemberCategory, typeof members> = {
  vocals: [],
  sound: [],
  art: [],
  video: [],
  admin: [],
}
for (const m of members) {
  for (const cat of getMemberCategories(m.tags)) {
    grouped[cat].push(m)
  }
}

export default function TeamPage() {
  useDocumentTitle('Состав')
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
                    <MemberCard key={`${id}-${m.id}`} member={m} index={i} />
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
    </div>
  )
}
