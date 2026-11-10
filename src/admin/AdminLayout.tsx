import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { useAdminAuth } from './store/useAdminAuth'
import { LogOut, ShieldCheck, Users, Disc3, Home, FileText } from 'lucide-react'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

/**
 * Layout админки. Требует залогиненного админа.
 * - Пока loading=true — спиннер.
 * - Если не залогинен — редирект на /admin/login с сохранением `from`.
 * - Если залогинен, но не админ — signOut и редирект на /admin/login
 *   (на практике сюда не попадём, т.к. signIn уже это проверяет, но на всякий).
 */
export default function AdminLayout() {
  useDocumentTitle('Админка')
  const location = useLocation()
  const { loading, isAdmin, isOwner, signOut } = useAdminAuth()

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-muted text-sm">Загрузка…</div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <Navigate
        to="/admin/login"
        state={{ from: location.pathname + location.search }}
        replace
      />
    )
  }

  return (
    <div className="min-h-[80vh] surface my-8 mx-4 sm:mx-6 lg:mx-10 overflow-hidden">
      <header className="flex flex-wrap items-center gap-4 justify-between p-5 border-b border-border bg-bg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-fire flex items-center justify-center">
            <ShieldCheck size={20} className="text-white" />
          </div>
          <div>
            <div className="font-display text-xl">FirePhoenix Admin</div>
            <div className="text-xs text-muted">
              {isOwner ? 'owner' : 'editor'} · полный доступ
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="btn text-sm"
            title="На сайт"
          >
            <Home size={14} /> На сайт
          </Link>
          <button
            type="button"
            onClick={() => {
              void signOut()
            }}
            className="btn text-sm"
          >
            <LogOut size={14} /> Выйти
          </button>
        </div>
      </header>
      <nav className="flex flex-wrap gap-2 p-3 border-b border-border">
        <AdminTab to="/admin/members" icon={<Users size={14} />} label="Участники" />
        <AdminTab to="/admin/releases" icon={<Disc3 size={14} />} label="Релизы" />
        <AdminTab to="/admin/content" icon={<FileText size={14} />} label="Контент" />
      </nav>
      <div className="p-5">
        <Outlet />
      </div>
    </div>
  )
}

function AdminTab({
  to,
  icon,
  label,
}: {
  to: string
  icon: React.ReactNode
  label: string
}) {
  return (
    <Link
      to={to}
      className="btn text-sm whitespace-nowrap"
    >
      {icon}
      {label}
    </Link>
  )
}