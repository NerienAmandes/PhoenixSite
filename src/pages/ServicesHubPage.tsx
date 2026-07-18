import { Link } from 'react-router-dom'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import {
  Sparkles,
  Mic2,
  ArrowUpRight,
  PenLine,
  Music4,
  Clock,
  ShieldCheck,
} from 'lucide-react'

const services = [
  {
    id: 'lyrics',
    title: 'Адаптация текста',
    eyebrow: 'Лирика',
    description:
      'Превращаем зарубежный трек в живую русскую песню: смысл, ритм, рифма — без «подстрочника».',
    icon: PenLine,
    href: '/services/lyrics',
    cta: 'Заказать адаптацию',
    bullets: [
      'Любые языки оригинала',
      'Срок — от 3 дней',
      'Бесплатные правки',
    ],
  },
  {
    id: 'cover',
    title: 'Кавер под ключ',
    eyebrow: 'Полный цикл',
    description:
      'Записываем кавер целиком — от лирики до готового видео. Собираете свой набор этапов под бюджет.',
    icon: Mic2,
    href: '/services/cover',
    cta: 'Заказать кавер',
    bullets: [
      '7 этапов на выбор',
      'От 3 000 до 8 000 ₽',
      'Примеры работ — в плейлисте',
    ],
  },
]

const guarantees = [
  { icon: Clock, title: 'Сроки', text: 'От 3 дней. Срочные заказы — ×2.' },
  { icon: ShieldCheck, title: 'Гарантия', text: 'Бесплатные правки и предоплата от 50%.' },
  { icon: Music4, title: 'Саунд', text: 'Свой стиль — без штампованного «кавера из ютуба».' },
]

export default function ServicesHubPage() {
  useDocumentTitle('Услуги')
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      <div className="reveal reveal-1">
        <span className="tag">
          <Sparkles size={12} /> Услуги
        </span>
      </div>
      <h1 className="reveal reveal-2 mt-4 font-display text-5xl sm:text-7xl lg:text-8xl leading-[1.2]">
        Что мы
        <br />
        <span className="text-fire">делаем для вас</span>
      </h1>
      <p className="reveal reveal-3 mt-6 max-w-2xl text-xl text-muted">
        Два направления — лирика и каверы. Выбирайте нужное: каждое живёт на
        отдельной странице с подробностями и формой заявки.
      </p>

      <section className="mt-14 grid gap-6 lg:grid-cols-2">
        {services.map((s, i) => {
          const Icon = s.icon
          return (
            <Link
              key={s.id}
              to={s.href}
              className="group surface relative overflow-hidden p-7 sm:p-10 reveal flex flex-col hover:border-accent transition-colors"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-fire opacity-10 blur-3xl group-hover:opacity-20 transition-opacity" />

              <div className="relative flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-fire flex items-center justify-center text-white shadow-glow">
                  <Icon size={22} />
                </div>
                <div>
                  <div className="text-sm tracking-[0.3em] uppercase text-accent">
                    {s.eyebrow}
                  </div>
                  <h2 className="font-display text-4xl sm:text-5xl leading-tight mt-1">
                    {s.title}
                  </h2>
                </div>
              </div>

              <p className="relative mt-5 text-lg text-muted leading-relaxed">
                {s.description}
              </p>

              <ul className="relative mt-6 grid gap-2 text-base">
                {s.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2.5">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-fire shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>

              <div className="relative mt-7 flex items-center gap-2 font-medium text-accent">
                {s.cta}
                <ArrowUpRight
                  size={16}
                  className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </div>
            </Link>
          )
        })}
      </section>

      <section className="mt-16 grid gap-4 sm:grid-cols-3">
        {guarantees.map((g, i) => {
          const Icon = g.icon
          return (
            <div
              key={g.title}
              className="surface-soft p-5 sm:p-6 reveal"
              style={{ animationDelay: `${0.2 + i * 0.06}s` }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-fireSoft flex items-center justify-center text-accent">
                  <Icon size={18} />
                </div>
                <div className="font-display text-2xl">{g.title}</div>
              </div>
              <p className="mt-3 text-base text-muted leading-relaxed">
                {g.text}
              </p>
            </div>
          )
        })}
      </section>

      <div className="mt-16 surface p-7 sm:p-9 text-center">
        <p className="text-lg text-muted max-w-2xl mx-auto">
          Не уверены, что выбрать? Напишите нам — подскажем формат под ваш
          трек и подберём разумный бюджет.
        </p>
        <a
          href="https://t.me/fire_PhoenixTeam"
          target="_blank"
          rel="noreferrer"
          className="btn btn-primary mt-5"
        >
          Спросить в Telegram <ArrowUpRight size={14} />
        </a>
      </div>
    </div>
  )
}
