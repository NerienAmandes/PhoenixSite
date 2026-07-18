import { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Menu, X, ChevronDown } from 'lucide-react'
import ThemeToggle from './ThemeToggle'

type NavItem = {
  to: string
  label: string
  children?: { to: string; label: string }[]
}

const links: NavItem[] = [
  { to: '/', label: 'Главная' },
  { to: '/about', label: 'О группе' },
  { to: '/team', label: 'Состав' },
  { to: '/releases', label: 'Релизы' },
  {
    to: '/services',
    label: 'Услуги',
    children: [
      { to: '/services/lyrics', label: 'Адаптация текста' },
      { to: '/services/cover', label: 'Кавер под ключ' },
    ],
  },
  { to: '/join', label: 'Набор' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)
  const closeTimer = useRef<number | null>(null)
  const location = useLocation()

  // Закрываем мобильное меню и дропдаун при смене маршрута
  useEffect(() => {
    setOpen(false)
    setServicesOpen(false)
  }, [location.pathname])

  // Закрываем дропдаун по Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setServicesOpen(false)
        setOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const openServices = () => {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
    setServicesOpen(true)
  }

  const scheduleCloseServices = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current)
    closeTimer.current = window.setTimeout(() => setServicesOpen(false), 120)
  }

  const isServicesActive =
    location.pathname === '/services' ||
    location.pathname.startsWith('/services/')

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

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {links.map((l) => {
              const hasChildren = !!l.children?.length
              if (!hasChildren) {
                return (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    end={l.to === '/'}
                    className={({ isActive }) =>
                      `px-5 py-3 rounded-xl text-base font-medium transition-colors ${
                        isActive ? 'text-accent bg-fireSoft' : 'text-ink hover:text-accent'
                      }`
                    }
                  >
                    {l.label}
                  </NavLink>
                )
              }

              // Ссылка с дропдауном
              const active = isServicesActive
              return (
                <div
                  key={l.to}
                  className="relative"
                  onMouseEnter={openServices}
                  onMouseLeave={scheduleCloseServices}
                  onFocus={openServices}
                  onBlur={scheduleCloseServices}
                >
                  <button
                    type="button"
                    onClick={() => setServicesOpen((v) => !v)}
                    aria-expanded={servicesOpen}
                    aria-haspopup="true"
                    className={`px-5 py-3 rounded-xl text-base font-medium transition-colors inline-flex items-center gap-1.5 ${
                      active
                        ? 'text-accent bg-fireSoft'
                        : 'text-ink hover:text-accent'
                    }`}
                  >
                    {l.label}
                    <ChevronDown
                      size={16}
                      className={`transition-transform duration-200 ${
                        servicesOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {servicesOpen && (
                    <div
                      className="absolute left-0 top-full pt-2 z-50"
                      onMouseEnter={openServices}
                      onMouseLeave={scheduleCloseServices}
                    >
                      <div
                        className="surface p-2 min-w-[240px] animate-riseIn"
                        style={{
                          boxShadow:
                            '0 18px 50px -20px rgba(0, 0, 0, 0.4), 0 0 0 1px var(--border-soft) inset',
                        }}
                      >
                        <Link
                          to={l.to}
                          className="block px-4 py-2.5 rounded-lg text-sm font-medium text-ink hover:text-accent hover:bg-fireSoft transition-colors"
                        >
                          Все услуги
                        </Link>
                        <div className="h-px bg-border my-1" />
                        {l.children!.map((c) => (
                          <Link
                            key={c.to}
                            to={c.to}
                            className={`block px-4 py-2.5 rounded-lg text-sm transition-colors ${
                              location.pathname === c.to
                                ? 'text-accent bg-fireSoft font-medium'
                                : 'text-ink hover:text-accent hover:bg-fireSoft'
                            }`}
                          >
                            {c.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
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

        {/* Mobile menu */}
        {open && (
          <div className="lg:hidden pb-6 animate-riseIn">
            <div className="grid gap-1 surface p-3">
              {links.map((l) => {
                const hasChildren = !!l.children?.length
                if (!hasChildren) {
                  return (
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
                  )
                }

                return (
                  <div key={l.to} className="grid gap-1">
                    <NavLink
                      to={l.to}
                      onClick={() => setOpen(false)}
                      className={`px-4 py-3.5 rounded-xl text-base font-medium ${
                        isServicesActive
                          ? 'text-accent bg-fireSoft'
                          : 'text-ink'
                      }`}
                    >
                      {l.label}
                    </NavLink>
                    <div className="grid gap-0.5 pl-4">
                      {l.children!.map((c) => (
                        <Link
                          key={c.to}
                          to={c.to}
                          onClick={() => setOpen(false)}
                          className={`px-4 py-2.5 rounded-lg text-sm ${
                            location.pathname === c.to
                              ? 'text-accent bg-fireSoft font-medium'
                              : 'text-ink-2 hover:text-accent'
                          }`}
                        >
                          · {c.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
