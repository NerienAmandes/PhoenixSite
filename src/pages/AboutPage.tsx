import {
  Flame,
  Music,
  Users,
  Sparkles,
  Quote,
  PenTool,
  Mic,
  Sliders,
  Clock,
  AudioLines,
  Film,
  Palette,
  Megaphone,
  Feather,
  Youtube,
  Send,
  ArrowUpRight,
} from 'lucide-react'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

function TikTokIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.1z" />
    </svg>
  )
}

const socials = [
  {
    label: 'YouTube',
    handle: '@firephoenix6297',
    desc: 'Каверы, Shorts, backstage',
    href: 'https://youtube.com/@firephoenix6297?si=-jOHXpqn3oIL4UQx',
    icon: Youtube,
  },
  {
    label: 'TikTok',
    handle: '@firephoenixteam11',
    desc: 'Короткие видео и вайбы',
    href: 'http://tiktok.com/@firephoenixteam11',
    icon: TikTokIcon,
  },
  {
    label: 'Telegram',
    handle: '@fire_PhoenixTeam',
    desc: 'Новости и общение с командой',
    href: 'https://t.me/fire_PhoenixTeam',
    icon: Send,
  },
]

const stats = [
  { icon: Music, label: 'Стиль', value: 'Кавер · Аниме · Pop' },
  { icon: Users, label: 'Команда', value: '30+ человек' },
  { icon: Sparkles, label: 'Адаптации', value: 'Каждый месяц' },
  { icon: Flame, label: 'Студия', value: 'FireLab' },
]

const process = [
  {
    num: '01',
    icon: PenTool,
    title: 'Текстовики переводят',
    text: 'Чтобы вы могли узнать перевод любимой песни.',
  },
  {
    num: '02',
    icon: Mic,
    title: 'Вокалисты поют',
    text: 'Дарят русские голоса персонажам и оригинальным исполнителям.',
  },
  {
    num: '03',
    icon: AudioLines,
    title: 'Звукари · Тюнеры · Таймеры',
    text: 'Собирают вокал воедино — настройка, тайминг, сведение.',
  },
  {
    num: '04',
    icon: Film,
    title: 'Виддеры · Художники',
    text: 'Создают интересные видео, стильные обложки и узнаваемых маскотов.',
  },
  {
    num: '05',
    icon: Megaphone,
    title: 'Медиаотдел продвигает',
    text: 'Несёт наше творчество в народ.',
  },
]

const roles = [
  { icon: PenTool, name: 'Текстовики', text: 'Адаптируют и переводят тексты' },
  { icon: Mic, name: 'Вокалисты', text: 'Дарят песням русский голос' },
  { icon: Sliders, name: 'Тюнеры', text: 'Идеально настраивают вокал' },
  { icon: Clock, name: 'Таймеры', text: 'Следят за таймингом' },
  { icon: AudioLines, name: 'Звукари', text: 'Сводят трек воедино' },
  { icon: Film, name: 'Виддеры', text: 'Создают видеоряд' },
  { icon: Palette, name: 'Художники', text: 'Стиль, обложки, маскоты' },
  { icon: Megaphone, name: 'Медиаотдел', text: 'Продвигают в народ' },
]

const milestones = [
  {
    date: '30.12.2019',
    year: '2019',
    title: 'Начало',
    text: 'Старт нашей деятельности — первая репетиция, первые идеи, первые шаги.',
  },
  {
    date: '24.07.2020',
    year: '2020',
    title: 'Первый кавер',
    text: 'Вышел первый кавер на нашем YouTube-канале.',
  },
  {
    date: '28.08.2025',
    year: '2025',
    title: 'Перезапуск YouTube',
    text: 'Снова начали вести YouTube — каверы раз или два в месяц, освоили Shorts.',
  },
  {
    date: '17.07.2026',
    year: '2026',
    title: '873 подписчика',
    text: 'Набрали 873 подписчика на нашем YouTube-канале.',
    isCurrent: true,
  },
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
      {/* Hero */}
      <div className="reveal reveal-1">
        <span className="tag"><Flame size={12} /> О группе</span>
      </div>
      <h1
        className="reveal reveal-2 mt-7 font-display text-5xl sm:text-7xl lg:text-8xl"
        style={{ lineHeight: 1.35 }}
      >
        Кто
        <br />
        <span className="text-fire">мы такие?</span>
      </h1>
      <p className="reveal reveal-3 mt-7 max-w-3xl text-lg sm:text-xl text-muted leading-relaxed">
        С вами на связи{' '}
        <span className="text-fire font-medium">Fire Phoenix Team</span>!
        Мы — Фениксы, творческий коллектив и семья, которых объединяет важная
        часть нашей жизни — <span className="text-ink font-medium">музыка</span>.
        Горячо любим своё дело и готовы согревать ваши сердца нашим творчеством.
      </p>

      {/* Stats */}
      <div className="reveal reveal-4 mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ icon: Icon, label, value }) => (
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

      {/* What we do */}
      <section className="mt-20 sm:mt-28">
        <div className="reveal">
          <h2 className="font-display text-4xl sm:text-6xl">
            Что мы <span className="text-fire">делаем</span>
          </h2>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-12 items-start">
          <div className="lg:col-span-5 reveal">
            <p className="text-lg sm:text-xl text-muted leading-relaxed">
              Занимаемся{' '}
              <span className="text-fire font-medium">
                адаптацией иностранных песен
              </span>{' '}
              на русский язык — не подстрочником, а живыми треками, в которых
              текст ложится на мелодию.
            </p>
            <p className="mt-4 text-base sm:text-lg text-muted leading-relaxed">
              Здесь можно найти каверы, которые точно придутся вам по душе.
            </p>
            <div className="mt-6 surface-soft p-5 text-sm sm:text-base">
              <div className="text-[10px] tracking-[0.3em] uppercase text-muted mb-2">
                Почему у нас получается
              </div>
              <p className="text-muted leading-relaxed">
                Потому что каждый Феникс по-своему уникален и отдаётся своему
                делу, чтобы радовать таких же любителей классной музыки.
              </p>
            </div>
          </div>

          <div className="lg:col-span-7 grid gap-3">
            {process.map((step, i) => (
              <div
                key={step.num}
                className="surface p-5 sm:p-6 flex items-center gap-4 sm:gap-5 reveal"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="font-display text-2xl sm:text-3xl text-fire shrink-0 w-10 sm:w-12">
                  {step.num}
                </div>
                <div className="w-11 h-11 rounded-2xl bg-fireSoft flex items-center justify-center text-accent shrink-0">
                  <step.icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-display text-lg sm:text-xl leading-tight">
                    {step.title}
                  </div>
                  <div className="text-sm sm:text-base text-muted mt-1">
                    {step.text}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team roles */}
      <section className="mt-20 sm:mt-28">
        <div className="reveal">
          <h2 className="font-display text-4xl sm:text-6xl">
            Наши <span className="text-fire">птички</span>
          </h2>
          <p className="mt-4 max-w-2xl text-base sm:text-lg text-muted">
            Фениксы невероятно разносторонние — каждый по-своему уникален.
            Восемь направлений, одна цель — радовать вас.
          </p>
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {roles.map((role, i) => (
            <div
              key={role.name}
              className="surface p-6 reveal hover:border-accent transition-colors"
              style={{ animationDelay: `${i * 0.04}s` }}
            >
              <div className="w-12 h-12 rounded-2xl bg-fire flex items-center justify-center text-white shadow-glow">
                <role.icon size={20} />
              </div>
              <div className="font-display text-2xl mt-5 leading-tight">
                {role.name}
              </div>
              <div className="text-sm sm:text-base text-muted mt-2 leading-relaxed">
                {role.text}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="mt-20 sm:mt-28">
        <div className="reveal">
          <h2 className="font-display text-4xl sm:text-6xl">
            Наш <span className="text-fire">путь</span>
          </h2>
        </div>
        <div className="mt-8 relative">
          <div className="absolute left-[19px] top-2 bottom-2 w-px bg-fire opacity-40" />
          <ol className="grid gap-6 sm:gap-7">
            {milestones.map((m, i) => (
              <li
                key={m.date}
                className="relative pl-14 reveal"
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <div
                  className={`milestone-dot absolute left-0 top-2 w-10 h-10 rounded-full flex items-center justify-center font-display text-sm ${
                    m.isCurrent ? 'bg-fire shadow-glow' : 'bg-fire/85'
                  }`}
                >
                  {m.year}
                </div>
                <div className="text-[10px] tracking-[0.3em] uppercase text-accent mb-1">
                  {m.date}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-display text-xl sm:text-2xl leading-tight">
                    {m.title}
                  </h3>
                  {m.isCurrent && (
                    <span className="now-badge inline-flex items-center gap-1 px-2 py-0.5 text-[10px] tracking-[0.2em] uppercase rounded-full">
                      <Youtube size={12} /> Сейчас
                    </span>
                  )}
                </div>
                <p className="text-base sm:text-lg leading-relaxed text-muted mt-1">
                  {m.text}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Manifesto quote */}
      <section className="mt-20 sm:mt-28 reveal">
        <div className="surface p-8 sm:p-12 lg:p-16 text-center relative overflow-hidden">
          <div className="absolute -top-6 -right-6 text-fire opacity-[0.07] pointer-events-none">
            <Quote size={240} />
          </div>
          <div className="relative">
            <div className="w-14 h-14 rounded-full bg-fire flex items-center justify-center text-white shadow-glow mx-auto">
              <Feather size={22} />
            </div>
            <blockquote className="mt-7 font-display text-2xl sm:text-4xl lg:text-5xl leading-tight max-w-3xl mx-auto">
              Наш полёт непрост — на пути встречаются{' '}
              <span className="text-fire">ветра, дожди и грозы</span>.
              <br className="hidden sm:block" />
              Но даже так мы продолжим свой путь, не останавливаясь.
            </blockquote>
            <div className="mt-8 text-[10px] tracking-[0.3em] uppercase text-muted">
              Спасибо за вашу поддержку
            </div>
          </div>
        </div>
      </section>

      {/* Socials */}
      <section className="mt-20 sm:mt-28">
        <div className="reveal">
          <h2 className="font-display text-4xl sm:text-6xl">
            Мы в <span className="text-fire">соцсетях</span>
          </h2>
          <p className="mt-4 max-w-2xl text-base sm:text-lg text-muted">
            Подписывайтесь — там новые каверы, backstage и живое общение
            с командой.
          </p>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {socials.map((s, i) => {
            const Icon = s.icon
            return (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className="surface p-6 sm:p-7 group flex items-start gap-5 reveal hover:border-accent transition-colors"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="w-12 h-12 shrink-0 rounded-2xl bg-fire flex items-center justify-center text-white shadow-glow">
                  <Icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-display text-2xl leading-tight">
                      {s.label}
                    </h3>
                    <ArrowUpRight
                      size={16}
                      className="text-muted group-hover:text-accent group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform"
                    />
                  </div>
                  <div className="text-sm text-accent mt-1">{s.handle}</div>
                  <div className="text-sm sm:text-base text-muted mt-2 leading-relaxed">
                    {s.desc}
                  </div>
                </div>
              </a>
            )
          })}
        </div>
      </section>

      {/* Gallery */}
      <section className="mt-20 sm:mt-28">
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
      </section>
    </div>
  )
}
