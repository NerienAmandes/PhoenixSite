import { useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { isValidEmail, isValidPassword } from '../utils/validators'
import { ArrowUpRight } from 'lucide-react'

export default function LoginPage() {
  useDocumentTitle('Вход')
  const navigate = useNavigate()
  const location = useLocation()
  const login = useAuthStore((s) => s.login)

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState<string | null>(null)
  const from = (location.state as { from?: string } | null)?.from ?? '/profile'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValidEmail(form.email)) {
      setError('Похоже, e-mail некорректен')
      return
    }
    if (!isValidPassword(form.password)) {
      setError('Пароль должен быть не короче 6 символов')
      return
    }
    const res = login(form.email, form.password)
    if (!res.ok) {
      setError(res.error ?? 'Не удалось войти')
      return
    }
    navigate(from, { replace: true })
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="grid lg:grid-cols-2 gap-10 max-w-5xl w-full surface overflow-hidden">
        <div className="relative hidden lg:block">
          <img
            src="https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=Concert%20backstage%20atmosphere%2C%20warm%20orange%20and%20red%20light%2C%20moody%20cinematic%2C%20microphones%20and%20cables%2C%20smoke&image_size=portrait_4_3"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-black/70 via-black/20 to-transparent" />
          <div className="absolute top-8 left-8 right-8 text-white">
            <div className="flex items-center gap-2">
              <div className="w-11 h-11 rounded-xl bg-fire flex items-center justify-center p-1.5">
              <img src="/logoPtitca.svg" alt="FirePhoenix" className="w-full h-full" />
            </div>
              <div className="font-display text-2xl">FirePhoenix</div>
            </div>
            <div className="mt-12 font-display text-4xl leading-tight">
              С возвращением
              <br />
              в <span className="text-fire">огонь</span>.
            </div>
            <p className="mt-4 text-white/80 text-sm max-w-xs">
              Войдите, чтобы следить за релизами, откликаться на вакансии и
              заказывать адаптации.
            </p>
          </div>
        </div>

        <div className="p-8 sm:p-12">
          <div className="lg:hidden mb-6 flex items-center gap-2">
            <div className="w-11 h-11 rounded-xl bg-base border border-border flex items-center justify-center p-1.5">
              <img src="/logo.svg" alt="FirePhoenix" className="w-full h-full" />
            </div>
            <div className="font-display text-2xl">FirePhoenix</div>
          </div>
          <h1 className="font-display text-4xl">Вход</h1>
          <p className="mt-2 text-muted text-sm">
            Нет аккаунта?{' '}
            <Link to="/register" className="text-accent hover:underline">
              Зарегистрируйтесь
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="mt-7 grid gap-4">
            <div>
              <label className="text-[10px] tracking-[0.3em] uppercase text-muted">
                E-mail
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="mt-2"
                autoComplete="email"
              />
            </div>
            <div>
              <label className="text-[10px] tracking-[0.3em] uppercase text-muted">
                Пароль
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••"
                className="mt-2"
                autoComplete="current-password"
              />
            </div>
            {error && (
              <div className="text-sm text-accent surface-soft p-3">{error}</div>
            )}
            <button type="submit" className="btn btn-primary mt-2">
              Войти <ArrowUpRight size={14} />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
