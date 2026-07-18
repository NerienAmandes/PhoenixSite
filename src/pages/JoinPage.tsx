import { useState } from 'react'
import { vacancies } from '../data/vacancies'
import VacancyItem from '../components/VacancyItem'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useAuthStore } from '../store/useAuthStore'
import { useSubmissionsStore } from '../store/useSubmissionsStore'
import { Check, ArrowUpRight, Megaphone, Loader2, AlertCircle } from 'lucide-react'
import { isValidEmail, isValidName, isValidBirthDate } from '../utils/validators'

export default function JoinPage() {
  useDocumentTitle('Набор')
  const user = useAuthStore((s) => s.user)
  const addSubmission = useSubmissionsStore((s) => s.add)

  const [form, setForm] = useState({
    name: user?.name ?? '',
    contact: user?.email ?? '',
    birthDate: '',
    experience: '',
    portfolio: '',
    role: vacancies[0].id,
    website: '', // honeypot
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setApiError(null)
    setSuccess(false)
    const next: Record<string, string> = {}
    if (!isValidName(form.name)) next.name = 'Укажите имя'
    if (!isValidEmail(form.contact)) next.contact = 'Похоже, e-mail некорректен'
    if (!isValidBirthDate(form.birthDate)) next.birthDate = 'Укажите дату в формате ДД.ММ.ГГГГ'
    if (form.experience.trim().length < 3) next.experience = 'Расскажите коротко об опыте'
    setErrors(next)
    if (Object.keys(next).length > 0) return

    setLoading(true)
    try {
      const res = await fetch('/api/send-telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.contact,
          instrument: form.role,
          experience: form.experience,
          message: `Дата рождения: ${form.birthDate}, Портфолио: ${form.portfolio || 'Не указано'}`,
          website: form.website, // honeypot
        }),
      })

      if (!res.ok) {
        let detail = ''
        try {
          const data = await res.json()
          detail = data?.error ? ` — ${data.error}` : ''
        } catch {
          /* ignore */
        }
        throw new Error(`Ошибка отправки (${res.status})${detail}`)
      }
    } catch (err) {
      console.warn('Telegram API не настроен или не работает:', err)
      const message =
        err instanceof Error
          ? err.message
          : 'Не удалось отправить отклик. Попробуйте позже или напишите нам напрямую.'
      setApiError(message)
      setLoading(false)
      return
    }

    try {
      addSubmission({
        userId: user?.id,
        type: 'join',
        payload: form,
      })
    } catch (err) {
      console.warn('addSubmission failed (не критично):', err)
    }

    setSuccess(true)
    setLoading(false)
    setForm({
      name: user?.name ?? '',
      contact: user?.email ?? '',
      birthDate: '',
      experience: '',
      portfolio: '',
      role: vacancies[0].id,
      website: '',
    })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      <div className="reveal reveal-1">
        <span className="tag"><Megaphone size={12} /> Набор 2026</span>
      </div>
      <h1 className="reveal reveal-2 mt-7 font-display text-5xl sm:text-7xl lg:text-8xl leading-[1.35]">
        Ищем
        <br />
        <span className="text-fire">единомышленников</span>
      </h1>
      <p className="reveal reveal-3 mt-6 max-w-2xl text-lg text-muted">
        Если ты горишь живой музыкой так же, как мы — оставь отклик. Возможно,
        именно ты станешь частью FirePhoenix.
      </p>

      <div className="mt-12 grid gap-4">
        {vacancies.map((v, i) => (
          <VacancyItem key={v.id} vacancy={v} index={i} />
        ))}
      </div>

      <div className="mt-20 grid gap-8 lg:grid-cols-12 items-start">
        <div className="lg:col-span-5">
          <h2 className="font-display text-4xl sm:text-5xl">Откликнуться</h2>
          <p className="mt-4 text-muted max-w-md">
            Расскажите немного о себе и пришлите ссылку на портфолио. Мы
            свяжемся с вами, если увидим совпадение.
          </p>
          <div className="mt-6 surface-soft p-5 text-sm">
            <div className="text-[10px] tracking-[0.3em] uppercase text-muted mb-2">
              Что мы ценим
            </div>
            <ul className="grid gap-1.5">
              <li>· Любовь к живым выступлениям</li>
              <li>· Ответственность и пунктуальность</li>
              <li>· Умение слышать коллег</li>
              <li>· Готовность расти вместе</li>
            </ul>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="lg:col-span-7 surface p-7 sm:p-9 sticky top-24">
          {success && (
            <div className="mb-6 surface-soft p-4 text-sm flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-fire flex items-center justify-center text-white shrink-0">
                <Check size={14} strokeWidth={3} />
              </div>
              <div>
                <div className="font-medium">Отклик отправлен!</div>
                <div className="text-muted">Спасибо! Мы рассмотрим вашу заявку в ближайшие дни.</div>
              </div>
            </div>
          )}

          {apiError && (
            <div className="mb-6 surface-soft p-4 text-sm flex items-start gap-3 border border-red-300/40">
              <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 shrink-0">
                <AlertCircle size={14} />
              </div>
              <div>
                <div className="font-medium">Ошибка отправки</div>
                <div className="text-muted">{apiError}</div>
              </div>
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="text-[10px] tracking-[0.3em] uppercase text-muted">Имя</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Иван Петров"
                className="mt-2"
              />
              {errors.name && <p className="mt-1.5 text-xs text-accent">{errors.name}</p>}
            </div>
            <div>
              <label className="text-[10px] tracking-[0.3em] uppercase text-muted">E-mail или Telegram</label>
              <input
                value={form.contact}
                onChange={(e) => setForm({ ...form, contact: e.target.value })}
                placeholder="hello@example.com"
                className="mt-2"
              />
              {errors.contact && <p className="mt-1.5 text-xs text-accent">{errors.contact}</p>}
            </div>
            <div>
              <label className="text-[10px] tracking-[0.3em] uppercase text-muted">Дата рождения</label>
              <input
                value={form.birthDate}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, '').slice(0, 8)
                  let formatted = digits
                  if (digits.length > 2) formatted = `${digits.slice(0, 2)}.${digits.slice(2)}`
                  if (digits.length > 4) formatted = `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4)}`
                  setForm({ ...form, birthDate: formatted })
                }}
                placeholder="ДД.ММ.ГГГГ"
                inputMode="numeric"
                maxLength={10}
                className="mt-2"
              />
              {errors.birthDate && <p className="mt-1.5 text-xs text-accent">{errors.birthDate}</p>}
            </div>
            <div>
              <label className="text-[10px] tracking-[0.3em] uppercase text-muted">Вакансия</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="mt-2"
              >
                {vacancies.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.role}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-[10px] tracking-[0.3em] uppercase text-muted">Опыт</label>
              <textarea
                value={form.experience}
                onChange={(e) => setForm({ ...form, experience: e.target.value })}
                placeholder="Где играли, на каких площадках, в каких коллективах..."
                className="mt-2"
              />
              {errors.experience && <p className="mt-1.5 text-xs text-accent">{errors.experience}</p>}
            </div>
            <div className="sm:col-span-2">
              <label className="text-[10px] tracking-[0.3em] uppercase text-muted">Ссылка на портфолио</label>
              <input
                value={form.portfolio}
                onChange={(e) => setForm({ ...form, portfolio: e.target.value })}
                placeholder="https://soundcloud.com/... или YouTube"
                className="mt-2"
              />
            </div>
            {/* Honeypot — невидимое поле против ботов. Не удаляй! */}
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
              className="hidden"
              aria-hidden="true"
            />
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary mt-6 w-full sm:w-auto">
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin mr-2" />
                Отправка...
              </>
            ) : (
              <>
                Отправить отклик <ArrowUpRight size={14} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
