import { useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { isValidEmail, isValidName, isValidPassword } from '../utils/validators'
import { ArrowUpRight } from 'lucide-react'

export default function RegisterPage() {
  useDocumentTitle('Регистрация')
  const navigate = useNavigate()
  const location = useLocation()
  const register = useAuthStore((s) => s.register)
  const from = (location.state as { from?: string } | null)?.from ?? '/profile'

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const next: Record<string, string> = {}
    if (!isValidName(form.name)) next.name = 'Имя должно содержать минимум 2 символа'
    if (!isValidEmail(form.email)) next.email = 'Похоже, e-mail некорректен'
    if (!isValidPassword(form.password)) next.password = 'Пароль должен быть не короче 6 символов'
    if (form.password !== form.confirm) next.confirm = 'Пароли не совпадают'
    setErrors(next)
    if (Object.keys(next).length > 0) return

    const res = register(form.name, form.email, form.password)
    if (!res.ok) {
      setSubmitError(res.error ?? 'Не удалось зарегистрироваться')
      return
    }
    navigate(from, { replace: true })
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="grid lg:grid-cols-2 gap-10 max-w-5xl w-full surface overflow-hidden">
        <div className="p-8 sm:p-12 order-2 lg:order-1">
          <div className="lg:hidden mb-6 flex items-center gap-2">
            <div className="w-11 h-11 rounded-xl bg-fire flex items-center justify-center p-1.5">
              <img src="/logoPtitca.svg" alt="FirePhoenix" className="w-full h-full" />
            </div>
            <div className="font-display text-2xl">FirePhoenix</div>
          </div>
          <h1 className="font-display text-4xl">Регистрация</h1>
          <p className="mt-2 text-muted text-sm">
            Уже есть аккаунт?{' '}
            <Link to="/login" className="text-accent hover:underline">
              Войти
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="mt-7 grid gap-4">
            <div>
              <label className="text-[10px] tracking-[0.3em] uppercase text-muted">Имя</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Иван Петров"
                className="mt-2"
                autoComplete="name"
              />
              {errors.name && <p className="mt-1.5 text-xs text-accent">{errors.name}</p>}
            </div>
            <div>
              <label className="text-[10px] tracking-[0.3em] uppercase text-muted">E-mail</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="mt-2"
                autoComplete="email"
              />
              {errors.email && <p className="mt-1.5 text-xs text-accent">{errors.email}</p>}
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] tracking-[0.3em] uppercase text-muted">Пароль</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••"
                  className="mt-2"
                  autoComplete="new-password"
                />
                {errors.password && <p className="mt-1.5 text-xs text-accent">{errors.password}</p>}
              </div>
              <div>
                <label className="text-[10px] tracking-[0.3em] uppercase text-muted">Подтверждение</label>
                <input
                  type="password"
                  value={form.confirm}
                  onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                  placeholder="••••••"
                  className="mt-2"
                  autoComplete="new-password"
                />
                {errors.confirm && <p className="mt-1.5 text-xs text-accent">{errors.confirm}</p>}
              </div>
            </div>
            {submitError && <div className="text-sm text-accent surface-soft p-3">{submitError}</div>}
            <button type="submit" className="btn btn-primary mt-2">
              Создать аккаунт <ArrowUpRight size={14} />
            </button>
            <p className="text-xs text-muted text-center">
              Регистрируясь, вы соглашаетесь с обработкой персональных данных.
            </p>
          </form>
        </div>

        <div className="relative hidden lg:block order-1 lg:order-2">
          <img
            src="https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=Studio%20recording%20session%2C%20vintage%20microphone%2C%20warm%20red%20and%20orange%20lighting%2C%20analog%20tape%2C%20moody%20cinematic&image_size=portrait_4_3"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-tl from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-8 left-8 right-8 text-white">
            <div className="font-display text-3xl">
              Присоединяйтесь к <span className="text-fire">огню</span>.
            </div>
            <p className="mt-3 text-white/80 text-sm max-w-xs">
              Личный кабинет, избранные треки, история заявок и быстрый
              доступ к новым релизам.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
