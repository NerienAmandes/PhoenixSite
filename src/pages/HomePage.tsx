import { Link } from 'react-router-dom'
import { ArrowUpRight, Play, Flame } from 'lucide-react'
import { releases } from '../data/releases'
import { services } from '../data/services'
import ReleaseCard from '../components/ReleaseCard'
import ServiceCard from '../components/ServiceCard'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export default function HomePage() {
  useDocumentTitle('Главная')
  // Показываем все предстоящие релизы (до 6 штук), чтобы Zombie Stage тоже был виден
  const upcoming = releases.filter((r) => r.status === 'upcoming').slice(0, 6)

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
                {[
                  { v: '~7', l: 'лет каверов' },
                  { v: '0', l: 'концертов' },
                  { v: '352 212', l: 'просмотров' },
                ].map((s) => (
                  <div key={s.l}>
                    <div className="font-display text-3xl text-fire">{s.v}</div>
                    <div className="text-[10px] tracking-[0.3em] uppercase text-muted">
                      {s.l}
                    </div>
                  </div>
                ))}
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
