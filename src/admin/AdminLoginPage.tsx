import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAdminAuth } from './store/useAdminAuth'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { ArrowUpRight, ShieldCheck } from 'lucide-react'

export default function AdminLoginPage() {
  useDocumentTitle('Вход в админку')
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn, loading, isAdmin } = useAdminAuth()

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState<string | null>(null)

  const from = (location.state as { from?: string } | null)?.from ?? '/admin'

  // Если уже залогинены как админ — редиректим сразу.
  if (isAdmin) {
    navigate(from, { replace: true })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const res = await signIn(form.email, form.password)
    if (!res.ok) {
      setError(res.error ?? 'Не удалось войти')
      return
    }
    navigate(from, { replace: true })
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full surface p-8 sm:p-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-fire flex items-center justify-center">
            <ShieldCheck size={22} className="text-white" />
          </div>
          <div>
            <div className="font-display text-2xl">FirePhoenix Admin</div>
            <div className="text-xs text-muted">вход для администраторов</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div>
            <label className="text-[10px] tracking-[0.3em] uppercase text-muted">
              E-mail
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="owner@firephoenix.team"
              className="mt-2"
              autoComplete="email"
              required
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
              required
            />
          </div>
          {error && (
            <div className="text-sm text-accent surface-soft p-3">{error}</div>
          )}
          <button
            type="submit"
            className="btn btn-primary mt-2"
            disabled={loading}
          >
            {loading ? 'Входим…' : 'Войти'} <ArrowUpRight size={14} />
          </button>
        </form>

        <p className="mt-6 text-xs text-muted">
          Доступ только для владельца и редакторов команды.
        </p>
      </div>
    </div>
  )
}
