import { members } from '../data/members'
import MemberCard from '../components/MemberCard'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { Users } from 'lucide-react'

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

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {members.map((m, i) => (
          <MemberCard key={m.id} member={m} index={i} />
        ))}
      </div>
    </div>
  )
}
