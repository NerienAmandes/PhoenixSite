import { Link } from 'react-router-dom'
import { Youtube, Send, ArrowUpRight } from 'lucide-react'
import type { ComponentType } from 'react'
import BoostyIcon from './BoostyIcon'
import TikTokIcon from './TikTokIcon'
import { SOCIALS, TEAM_FOUNDED_LABEL, type SocialId } from '../config/team'

// Общий тип для иконки соцсети: подходит и для lucide-компонентов (size: number | string),
// и для наших обычных функциональных компонентов (size: number). `string` нужен для совместимости
// с типизацией lucide-иконок (propTypes инвариантны, поэтому более узкий number не подходит).
type IconComponent = ComponentType<{ size?: number | string }>

const ICONS: Record<SocialId, IconComponent> = {
  youtube: Youtube,
  tiktok: TikTokIcon,
  telegram: Send,
  boosty: BoostyIcon,
}

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
                  cover band · est. {TEAM_FOUNDED_LABEL}
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
              {SOCIALS.map((s) => {
                const Icon = ICONS[s.id]
                return (
                  <li key={s.id}>
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
