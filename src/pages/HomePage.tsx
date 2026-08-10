import { Link } from 'react-router-dom'
import { ArrowUpRight, Play, Flame, Eye } from 'lucide-react'
import { releases } from '../data/releases'
import { services } from '../data/services'
import ReleaseCard from '../components/ReleaseCard'
import ServiceCard from '../components/ServiceCard'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useYouTubeStats } from '../hooks/useYouTubeStats'
import { formatNumber, formatAge, formatDate } from '../utils/formatters'

export default function HomePage() {
  useDocumentTitle('Главная')
  // Показываем все предстоящие релизы (до 6 штук), чтобы Zombie Stage тоже был виден
  const upcoming = releases.filter((r) => r.status === 'upcoming').slice(0, 6)
  // Плейлист выпущенных релизов: только те, у которых есть YouTube-ссылка.
  // Добавил новое видео в data/releases.ts — карточка автоматически появится на главной.
  const released = releases
    .filter((r) => r.status === 'released' && r.platforms.youtube)
    .sort((a, b) => +new Date(b.releaseDate) - +new Date(a.releaseDate))
  const { data: ytStats, ageSeconds } = useYouTubeStats()
  // Пока API не ответило, держим цифру из ТЗ как фоллбэк, чтобы не дёргать вёрстку
  const views = ytStats?.views ?? 352212
  // -1 от API означает, что канал скрыл счётчик подписчиков. До ответа API — 0.
  const subscribers = ytStats?.subscribers ?? 0
  const subsHidden = ytStats?.subscribers === -1 || ytStats?.hiddenSubscribers === true

  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg" />
        <div className="absolute -top-32 -left-24 w-[520px] h-[520px] flame-blob animate-breathe" style={{ background: 'radial-gradient(circle, #F84B6B 0%, transparent 60%)' }} />
        <div className="absolute -bottom-40 -right-24 w-[600px] h-[600px] flame-blob animate-breathe" style={{ background: 'radial-gradient(circle, #F7882E 0%, transparent 60%)', animationDelay: '2s' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24 sm:pt-20 sm:pb-32">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <div className="reveal reveal-1">
                <span className="tag">
                  <Flame size={12} /> Международная · кавер - команда
                </span>
              </div>
              <h1 className="reveal reveal-2 mt-7 font-display text-[64px] sm:text-[88px] lg:text-[112px] leading-[1.35] tracking-tight">
                Мы те,
                <br />
                кто живёт
                <br />
                <span className="text-fire">музыкой.</span>
              </h1>
              <p className="reveal reveal-3 mt-7 max-w-xl text-lg text-muted">
                FirePhoenix — кавер-команда, которая превращает любимые хиты в
                живые истории на русском. Наша команда живёт музыкой и радует тех, кто разделяет эту любовь вместе с нами.
                 Почти 7 лет каверов, 7 лет ярких воспоминаний и стремлений.
              </p>
              <div className="reveal reveal-4 mt-9 flex flex-wrap gap-3">
                <a
                  href={releases.find((r) => r.status === 'released')?.platforms.youtube ?? '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary"
                >
                  <Play size={14} fill="currentColor" /> Слушать
                </a>
                <Link to="/services" className="btn btn-outline">
                  Заказать адаптацию <ArrowUpRight size={14} />
                </Link>
              </div>
              <div className="reveal reveal-5 mt-12 grid grid-cols-3 gap-6 max-w-md">
                <div>
                  <div className="font-display text-3xl text-fire">~7</div>
                  <div className="text-[10px] tracking-[0.3em] uppercase text-muted min-h-[1.5em]">
                    лет каверов
                  </div>
                </div>
                <div>
                  <div
                    className="font-display text-3xl text-fire"
                    title={subsHidden ? 'Канал скрыл количество подписчиков' : ytStats ? `Обновлено ${formatAge(ageSeconds)}` : undefined}
                  >
                    {subsHidden ? '—' : formatNumber(subscribers)}
                  </div>
                  <div
                    className="text-[10px] tracking-[0.3em] uppercase text-muted min-h-[1.5em]"
                    title={subsHidden ? 'Канал скрыл количество подписчиков' : ytStats ? `Обновлено ${formatAge(ageSeconds)}` : undefined}
                  >
                    подписчиков
                  </div>
                </div>
                <div>
                  <div className="font-display text-3xl text-fire inline-flex items-center gap-1.5">
                    <Eye size={18} className="opacity-80" />
                    {formatNumber(views)}
                  </div>
                  <div
                    className="text-[10px] tracking-[0.3em] uppercase text-muted min-h-[1.5em]"
                    title={ytStats ? `Обновлено ${formatAge(ageSeconds)}` : undefined}
                  >
                    просмотров{ytStats ? ` · ${formatAge(ageSeconds)}` : ''}
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 relative">
              <div className="reveal reveal-3 relative aspect-square rounded-[36px] overflow-hidden surface animate-floaty">
                <img
                  src="/Phoenix.jpg"
                  alt="FirePhoenix"
                  className="w-full h-full object-cover"
                  width={800}
                  height={800}
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="text-[10px] tracking-[0.3em] uppercase text-white/80">
                    С 2019 года
                  </div>
                  <div className="font-display text-2xl mt-1 text-white">
                    Почти 7 лет каверов
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
          <div>
            <div className="text-[10px] tracking-[0.3em] uppercase text-accent">
              Уже на канале
            </div>
            <h2 className="font-display text-4xl sm:text-5xl mt-1">
              Наши <span className="text-fire">релизы</span>
            </h2>
            <div className="mt-2 text-sm text-muted">
              {released.length} {released.length === 1 ? 'видео' : 'видео'} в плейлисте
            </div>
          </div>
          <Link to="/releases" className="btn btn-ghost">
            Все релизы <ArrowUpRight size={14} />
          </Link>
        </div>
        {released.length === 0 ? (
          <div className="surface p-10 text-center text-muted">
            Плейлист скоро пополнится — мы готовим новое видео.
          </div>
        ) : (
          <div className="grid gap-5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {released.map((r) => (
              <a
                key={r.id}
                href={r.platforms.youtube}
                target="_blank"
                rel="noreferrer"
                className="group surface relative overflow-hidden hover:-translate-y-1 transition-transform duration-300 flex flex-col"
                title={`${r.title} — ${r.originalArtist}`}
              >
                <div className="aspect-square relative overflow-hidden">
                  <img
                    src={r.cover}
                    alt={r.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <span className="absolute top-3 left-3 tag">
                    <Play size={12} fill="currentColor" /> Видео
                  </span>
                  <div className="absolute bottom-3 right-3 inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/95 text-black opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all">
                    <Play size={14} fill="currentColor" />
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <div className="text-[10px] tracking-[0.3em] uppercase text-muted mb-1 line-clamp-1">
                    {r.originalArtist}
                  </div>
                  <h3 className="font-display text-lg leading-tight line-clamp-2">
                    {r.title}
                  </h3>
                  <div className="mt-auto pt-2 text-xs text-muted">
                    {formatDate(r.releaseDate)}
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
          <div>
            <div className="text-[10px] tracking-[0.3em] uppercase text-accent">
              Скоро в эфире
            </div>
            <h2 className="font-display text-4xl sm:text-5xl mt-1">
              Предстоящие релизы
            </h2>
          </div>
          <Link to="/releases" className="btn btn-ghost">
            Все релизы <ArrowUpRight size={14} />
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {upcoming.map((r, i) => (
            <ReleaseCard key={r.id} release={r} index={i} />
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid gap-10 lg:grid-cols-12 items-start">
          <div className="lg:col-span-4">
            <div className="text-[10px] tracking-[0.3em] uppercase text-accent">
              Услуги
            </div>
            <h2 className="font-display text-4xl sm:text-5xl mt-1">
              Адаптация
              <br />
              <span className="text-fire">текстов</span>
              <br />
              на русский
            </h2>
            <p className="mt-5 text-muted max-w-md">
              Берём трек на английском, корейском, испанском — и делаем из него
              живой русский хит с естественными рифмами и сохранённым смыслом.
            </p>
            <Link to="/services" className="btn btn-primary mt-7">
              Заказать адаптацию <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className="lg:col-span-8 grid gap-5 sm:grid-cols-2">
            {services.slice(0, 2).map((s, i) => (
              <ServiceCard key={s.id} service={s} index={i} />
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="surface relative overflow-hidden p-10 sm:p-14 text-center">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-fire opacity-20 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-warm opacity-20 blur-3xl" />
          <div className="relative">
            <div className="text-[10px] tracking-[0.3em] uppercase text-accent">
              Набор 2026
            </div>
            <h2 className="font-display text-4xl sm:text-6xl mt-2">
              Ищем <span className="text-fire">единомышленников</span>
            </h2>
            <p className="mt-5 max-w-2xl mx-auto text-muted">
              Открыты вакансии для бэк-вокалистов, звукорежиссёра и менеджера
              по концертам. Если горишь музыкой — нам по пути.
            </p>
            <Link to="/join" className="btn btn-primary mt-7">
              Откликнуться <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
