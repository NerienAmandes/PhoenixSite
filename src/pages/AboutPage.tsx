import { Flame, Music, Users, Award } from 'lucide-react'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

const milestones = [
  { year: '2019', text: 'Первая репетиция в гараже на окраине Москвы. Состав — три человека.' },
  { year: '2020', text: 'Первый онлайн-концерт во время пандемии. 12 000 зрителей.' },
  { year: '2022', text: 'Выход дебютного трека «Мы Выше». 1 миллион прослушиваний за квартал.' },
  { year: '2023', text: 'Гастрольный тур по 14 городам России. 80 концертов за год.' },
  { year: '2024', text: 'Открытие собственной студии FireLab. Старт услуги адаптации текстов.' },
  { year: '2026', text: 'Новый сезон: семь музыкантов, 8 релизов, сотрудничество с артистами.' },
]

const gallery = [
  'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=Band%20rehearsal%20in%20warm%20vintage%20studio%2C%20guitars%2C%20drums%2C%20warm%20orange%20light%2C%20analog%20film%20look&image_size=landscape_4_3',
  'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=Live%20concert%20crowd%20view%20from%20stage%2C%20red%20spotlights%2C%20hands%20in%20air%2C%20cinematic%20concert%20photography&image_size=landscape_4_3',
  'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=Microphone%20on%20vintage%20stage%2C%20spotlight%2C%20orange%20and%20red%20haze%2C%20moody%20close%20up&image_size=square',
  'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=Backstage%20of%20a%20rock%20band%2C%20instruments%20cases%2C%20tape%2C%20vintage%20warm%20light&image_size=landscape_4_3',
  'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=Vinyl%20records%20on%20wooden%20table%2C%20warm%20light%2C%20analog%20retro%20vibe&image_size=square',
  'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=Drum%20set%20close%20up%20with%20cymbals%2C%20dramatic%20red%20light%2C%20concert%20atmosphere&image_size=landscape_4_3',
]

export default function AboutPage() {
  useDocumentTitle('О группе')
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      <div className="reveal reveal-1">
        <span className="tag"><Flame size={12} /> О группе</span>
      </div>
      <h1 className="reveal reveal-2 mt-4 font-display text-5xl sm:text-7xl lg:text-8xl leading-[0.95]">
        История
        <br />
        <span className="text-fire">огня</span>
      </h1>
      <p className="reveal reveal-3 mt-7 max-w-2xl text-lg text-muted">
        FirePhoenix — это семь музыкантов, которые однажды решили, что
        кавер-версии могут быть не хуже оригиналов. И оказались правы.
      </p>

      <div className="reveal reveal-4 mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Music, label: 'Стиль', value: 'Pop · Rock · Indie' },
          { icon: Users, label: 'Состав', value: '7 человек' },
          { icon: Award, label: 'Концерты', value: '120+' },
          { icon: Flame, label: 'Студия', value: 'FireLab · Москва' },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="surface p-5">
            <div className="w-10 h-10 rounded-2xl bg-fireSoft flex items-center justify-center text-accent">
              <Icon size={18} />
            </div>
            <div className="text-[10px] tracking-[0.3em] uppercase text-muted mt-4">
              {label}
            </div>
            <div className="font-display text-xl mt-1">{value}</div>
          </div>
        ))}
      </div>

      <div className="mt-20">
        <h2 className="font-display text-3xl sm:text-5xl">Ключевые вехи</h2>
        <div className="mt-8 relative">
          <div className="absolute left-[19px] top-2 bottom-2 w-px bg-fire opacity-40" />
          <ol className="grid gap-6">
            {milestones.map((m, i) => (
              <li
                key={m.year}
                className="relative pl-14 reveal"
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <div className="absolute left-0 top-1 w-10 h-10 rounded-full bg-fire text-white flex items-center justify-center font-display text-sm">
                  {m.year}
                </div>
                <p className="text-base sm:text-lg leading-relaxed">{m.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="mt-20">
        <h2 className="font-display text-3xl sm:text-5xl">Галерея</h2>
        <div className="mt-8 grid gap-3 sm:grid-cols-4">
          {gallery.map((src, i) => (
            <div
              key={i}
              className={`overflow-hidden rounded-3xl border border-border ${
                i === 0 || i === 3 ? 'sm:col-span-2 sm:row-span-2 aspect-square' : 'aspect-square'
              }`}
            >
              <img
                src={src}
                alt=""
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
