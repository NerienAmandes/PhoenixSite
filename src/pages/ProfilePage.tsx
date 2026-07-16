import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { useSubmissionsStore } from '../store/useSubmissionsStore'
import { useFavoritesStore } from '../store/useFavoritesStore'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { releases } from '../data/releases'
import { vacancies } from '../data/vacancies'
import { services } from '../data/services'
import { formatDate } from '../utils/formatters'
import { Sun, Moon, LogOut, Heart, FileText, Sparkles, User as UserIcon, Megaphone } from 'lucide-react'
import { useThemeStore } from '../store/useThemeStore'
import ReleaseCard from '../components/ReleaseCard'
import { useState } from 'react'

export default function ProfilePage() {
  useDocumentTitle('Личный кабинет')
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const updateProfile = useAuthStore((s) => s.updateProfile)
  const submissions = useSubmissionsStore((s) => s.submissions)
  const removeSubmission = useSubmissionsStore((s) => s.remove)
  const favorites = useFavoritesStore((s) => s.favorites)
  const { theme, toggle } = useThemeStore()

  const [name, setName] = useState(user?.name ?? '')
  const [savedNotice, setSavedNotice] = useState<string | null>(null)

  if (!user) {
    return <Navigate to="/login" replace />
  }

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim().length < 2) return
    updateProfile({ name: name.trim() })
    setSavedNotice('Имя сохранено')
    setTimeout(() => setSavedNotice(null), 2200)
  }

  const mySubmissions = submissions.filter((s) => s.userId === user.id)
  const favoriteReleases = releases.filter((r) => favorites.includes(r.id))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      <div className="reveal reveal-1">
        <span className="tag"><UserIcon size={12} /> Личный кабинет</span>
      </div>
      <h1 className="reveal reveal-2 mt-4 font-display text-5xl sm:text-7xl leading-[0.95]">
        Привет,
        <br />
        <span className="text-fire">{user.name.split(' ')[0]}!</span>
      </h1>
      <p className="reveal reveal-3 mt-5 text-muted">
        Управляйте профилем, заявками и избранным.
      </p>

      <div className="mt-12 grid gap-5 lg:grid-cols-12">
        <div className="lg:col-span-4 grid gap-5">
          <div className="surface p-6">
            <div className="text-[10px] tracking-[0.3em] uppercase text-muted">Профиль</div>
            <div className="mt-4 flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-fire flex items-center justify-center text-white font-display text-2xl">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-display text-2xl leading-tight">{user.name}</div>
                <div className="text-sm text-muted">{user.email}</div>
              </div>
            </div>
            <form onSubmit={handleSaveName} className="mt-5 grid gap-3">
              <div>
                <label className="text-[10px] tracking-[0.3em] uppercase text-muted">Имя</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-2"
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Сохранить
              </button>
              {savedNotice && <p className="text-xs text-accent">{savedNotice}</p>}
            </form>
            <div className="mt-5 pt-5 border-t border-border text-xs text-muted">
              На FirePhoenix с {formatDate(user.registeredAt)}
            </div>
          </div>

          <div className="surface p-6">
            <div className="text-[10px] tracking-[0.3em] uppercase text-muted">Тема оформления</div>
            <p className="mt-2 text-sm text-muted">
              Сейчас активна: <span className="text-ink">{theme === 'dark' ? 'тёмная' : 'светлая'}</span>
            </p>
            <button onClick={toggle} className="btn btn-outline mt-4 w-full">
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
              Включить {theme === 'dark' ? 'светлую' : 'тёмную'}
            </button>
          </div>

          <button onClick={logout} className="btn btn-ghost w-full">
            <LogOut size={14} /> Выйти из аккаунта
          </button>
        </div>

        <div className="lg:col-span-8 grid gap-5">
          <div className="surface p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] tracking-[0.3em] uppercase text-muted">Заявки</div>
                <h2 className="font-display text-3xl mt-1">Мои заявки</h2>
              </div>
              <div className="text-sm text-muted">{mySubmissions.length}</div>
            </div>

            <div className="mt-5 grid gap-3">
              {mySubmissions.length === 0 && (
                <div className="surface-soft p-5 text-sm text-muted text-center">
                  Пока заявок нет. Закажите адаптацию или откликнитесь на вакансию — здесь появится история.
                </div>
              )}
              {mySubmissions.map((s) => {
                const isService = s.type === 'service'
                const Icon = isService ? Sparkles : Megaphone
                const title = isService
                  ? services.find((sv) => sv.id === s.payload.package)?.title ?? 'Адаптация'
                  : vacancies.find((v) => v.id === s.payload.role)?.role ?? 'Вакансия'
                return (
                  <div
                    key={s.id}
                    className="surface-soft p-4 flex items-start gap-4"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-fireSoft flex items-center justify-center text-accent shrink-0">
                      <Icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] tracking-[0.3em] uppercase text-accent">
                          {isService ? 'Услуга' : 'Набор'}
                        </span>
                        <span className="text-xs text-muted">{formatDate(s.createdAt)}</span>
                      </div>
                      <div className="font-display text-lg leading-tight mt-1">{title}</div>
                      {s.payload.track && (
                        <div className="text-xs text-muted mt-1 truncate">Трек: {s.payload.track}</div>
                      )}
                    </div>
                    <button
                      onClick={() => removeSubmission(s.id)}
                      className="text-xs text-muted hover:text-accent"
                    >
                      Удалить
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="surface p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] tracking-[0.3em] uppercase text-muted">Избранное</div>
                <h2 className="font-display text-3xl mt-1 flex items-center gap-2">
                  <Heart size={20} className="text-accent" fill="currentColor" /> Избранные треки
                </h2>
              </div>
              <div className="text-sm text-muted">{favoriteReleases.length}</div>
            </div>

            {favoriteReleases.length === 0 ? (
              <div className="mt-5 surface-soft p-5 text-sm text-muted text-center">
                Нажмите на сердечко в карточке релиза, чтобы добавить трек сюда.
              </div>
            ) : (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {favoriteReleases.map((r) => (
                  <ReleaseCard key={r.id} release={r} />
                ))}
              </div>
            )}
          </div>

          <div className="surface p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-fireSoft flex items-center justify-center text-accent">
              <FileText size={18} />
            </div>
            <div className="flex-1 text-sm text-muted">
              Это ваш личный архив взаимодействия с FirePhoenix. Все данные
              хранятся только в вашем браузере.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
