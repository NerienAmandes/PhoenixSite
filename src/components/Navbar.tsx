import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import ThemeToggle from './ThemeToggle'

const links = [
  { to: '/', label: 'Главная' },
  { to: '/about', label: 'О группе' },
  { to: '/team', label: 'Состав' },
  { to: '/releases', label: 'Релизы' },
  { to: '/services', label: 'Услуги' },
  { to: '/join', label: 'Набор' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header
      className="sticky top-0 z-40 backdrop-blur-md"
      style={{ background: 'color-mix(in srgb, var(--bg-base) 78%, transparent)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-14 h-14 rounded-2xl bg-base border border-border flex items-center justify-center p-2 group-hover:scale-105 transition-transform shadow-card">
              <img src="/logoPtitca.svg" alt="FirePhoenix" className="w-full h-full" />
            </div>
            <div className="leading-none">
              <div className="font-display text-3xl">FirePhoenix</div>
              <div className="text-xs tracking-[0.3em] uppercase text-muted mt-1">
                cover band
              </div>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                className={({ isActive }) =>
                  `px-5 py-3 rounded-xl text-base font-medium transition-colors ${
                    isActive
                      ? 'text-accent bg-fireSoft'
                      : 'text-ink hover:text-accent'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setOpen((v) => !v)}
              className="lg:hidden btn btn-icon btn-outline"
              aria-label="Меню"
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {open && (
          <div className="lg:hidden pb-6 animate-riseIn">
            <div className="grid gap-1 surface p-3">
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.to === '/'}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `px-4 py-3.5 rounded-xl text-base ${
                      isActive ? 'text-accent bg-fireSoft' : 'text-ink'
                    }`
                  }
                >
                  {l.label}
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
