import { Link } from 'react-router-dom'
import { Youtube, Send, ArrowUpRight } from 'lucide-react'

function TikTokIcon({ size = 16 }: { size?: number }) {
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
    href: 'https://youtube.com/@firephoenix6297?si=-jOHXpqn3oIL4UQx',
    icon: Youtube,
  },
  {
    label: 'TikTok',
    handle: '@firephoenixteam11',
    href: 'http://tiktok.com/@firephoenixteam11',
    icon: TikTokIcon,
  },
  {
    label: 'Telegram',
    handle: '@fire_PhoenixTeam',
    href: 'https://t.me/fire_PhoenixTeam',
    icon: Send,
  },
]

export default function Footer() {
  return (
    <footer className="relative mt-24 border-t border-border">
      <div className="absolute inset-x-0 -top-px h-px bg-fire opacity-60" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2 max-w-sm">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-base border border-border flex items-center justify-center p-2 shadow-card">
                <img src="/logoPtitca.svg" alt="FirePhoenix" className="w-full h-full" />
              </div>
              <div>
                <div className="font-display text-3xl">FirePhoenix</div>
                <div className="text-xs tracking-[0.3em] uppercase text-muted mt-1">
                  cover band · est. 2019
                </div>
              </div>
            </div>
            <p className="mt-5 text-base text-muted">
              Кавер-группа, в которой рождается музыка. Берём любимые хиты и
              превращаем их в истории на русском языке.
            </p>
          </div>

          <div>
            <div className="text-xs tracking-[0.3em] uppercase text-muted mb-5">
              Навигация
            </div>
            <ul className="grid gap-2.5 text-base">
              <li><Link to="/about" className="hover:text-accent">О группе</Link></li>
              <li><Link to="/team" className="hover:text-accent">Состав</Link></li>
              <li><Link to="/releases" className="hover:text-accent">Релизы</Link></li>
              <li>
                <Link to="/services" className="hover:text-accent">Услуги</Link>
                <ul className="grid gap-1.5 mt-1.5 ml-4 text-sm text-muted">
                  <li>
                    <Link to="/services/lyrics" className="hover:text-accent">
                      · Адаптация текста
                    </Link>
                  </li>
                  <li>
                    <Link to="/services/cover" className="hover:text-accent">
                      · Кавер под ключ
                    </Link>
                  </li>
                </ul>
              </li>
              <li><Link to="/join" className="hover:text-accent">Набор</Link></li>
            </ul>
          </div>

          <div>
            <div className="text-xs tracking-[0.3em] uppercase text-muted mb-5">
              Соцсети
            </div>
            <ul className="grid gap-3 text-base">
              {socials.map((s) => {
                const Icon = s.icon
                return (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noreferrer"
                      className="group inline-flex items-center gap-2 hover:text-accent"
                    >
                      <Icon size={16} />
                      <span>{s.label}</span>
                      <span className="text-xs text-muted group-hover:text-accent">
                        {s.handle}
                      </span>
                      <ArrowUpRight
                        size={12}
                        className="opacity-0 -ml-1 group-hover:opacity-100 group-hover:ml-0 transition-all"
                      />
                    </a>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-muted">
          <div>© {new Date().getFullYear()} FirePhoenix. Все права защищены.</div>
          <div className="tracking-[0.3em] uppercase">Сделано с огнём</div>
        </div>
      </div>
    </footer>
  )
}
