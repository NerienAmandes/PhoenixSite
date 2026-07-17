import { useState, useMemo } from 'react'
import { services } from '../data/services'
import {
  COVER_MIN_PRICE,
  COVER_MAX_PRICE,
  COVER_DEFAULT_STAGES,
} from '../data/covers'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useAuthStore } from '../store/useAuthStore'
import { useSubmissionsStore } from '../store/useSubmissionsStore'
import {
  Check,
  ArrowUpRight,
  Sparkles,
  Zap,
  Scale,
  Hammer,
  ChevronDown,
  AlertCircle,
  Loader2,
  Mic2,
  PenLine,
  Sliders,
  Palette,
  Video,
  type LucideIcon,
} from 'lucide-react'
import { isValidEmail, isValidName } from '../utils/validators'
import { COVER_STAGES, type CoverStageId } from '../types'

const STAGE_ICONS: Record<CoverStageId, LucideIcon> = {
  lyrics: PenLine,
  vocal: Mic2,
  tuning: Sliders,
  mixing: Sliders,
  art: Palette,
  video: Video,
}

const priceTable = [
  { size: 'TV-size', duration: 'до 3-х минут', price: 'от 500 ₽', japanese: 'от 700 ₽' },
  { size: 'Full-size', duration: 'от 3-х до 5-ти минут', price: 'от 1 000 ₽', japanese: 'от 1 400 ₽' },
  { size: 'Длинные треки', duration: 'от 5-ти минут', price: '+100 ₽ / мин', japanese: 'по стандартной сетке' },
]

const factors = [
  { title: 'Высокий темп', text: 'Очень быстрый ритм или речитатив.' },
  { title: 'Плотность текста', text: 'Большой объём смысла в малом количестве слогов.' },
  { title: 'Специфика', text: 'K-pop, рэп, узкоспециализированные фэндомы.' },
  { title: 'Язык', text: 'Работа с японским языком и сложными лингвистическими структурами.' },
]

const conditions = [
  { title: 'Предоплата', text: 'Работаем по предоплате от 50% до 100% от стоимости заказа.' },
  { title: 'Сроки', text: 'Стандартный дедлайн — от 3-х дней.' },
  { title: 'Отказ от заказа', text: 'Если вы решили отказаться после того, как мы выполнили треть и более работы, предоплата не возвращается.' },
  { title: 'Право на отказ', text: 'Мы оставляем за собой право отказаться от заказа, если песня слишком сложная или не подходит по тематике.' },
  { title: 'Правки', text: 'В рамках одного заказа — бесплатная корректировка текста по вашим замечаниям.' },
]

export default function ServicesPage() {
  useDocumentTitle('Услуги')
  const user = useAuthStore((s) => s.user)
  const addSubmission = useSubmissionsStore((s) => s.add)

  const [form, setForm] = useState({
    name: user?.name ?? '',
    contact: user?.email ?? '',
    track: '',
    package: services[0].id,
    comment: '',
    website: '', // honeypot
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [openCondition, setOpenCondition] = useState<number | null>(0)

  // ----- Кавер-форма (отдельное состояние) -----
  const [coverStages, setCoverStages] = useState<CoverStageId[]>(COVER_DEFAULT_STAGES)
  const [coverComment, setCoverComment] = useState('')
  const [coverName, setCoverName] = useState(user?.name ?? '')
  const [coverContact, setCoverContact] = useState(user?.email ?? '')
  const [coverTrack, setCoverTrack] = useState('')
  const [coverWebsite, setCoverWebsite] = useState('') // honeypot
  const [coverErrors, setCoverErrors] = useState<Record<string, string>>({})
  const [coverSuccess, setCoverSuccess] = useState(false)
  const [coverLoading, setCoverLoading] = useState(false)
  const [coverApiError, setCoverApiError] = useState<string | null>(null)

  // Автоподсчёт: сумма по выбранным этапам, но не меньше минимума.
  const coverCalc = useMemo(() => {
    const raw = coverStages.reduce(
      (sum, id) => sum + (COVER_STAGES.find((s) => s.id === id)?.basePrice ?? 0),
      0
    )
    const total = Math.max(COVER_MIN_PRICE, raw)
    return {
      raw,
      total,
      clamped: raw < COVER_MIN_PRICE,
      exceedsMax: raw > COVER_MAX_PRICE,
    }
  }, [coverStages])

  const toggleStage = (id: CoverStageId) => {
    setCoverStages((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  const submitToTelegram = async (
    payload: Record<string, string>
  ): Promise<string | null> => {
    try {
      const res = await fetch('/api/send-telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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
      return null
    } catch (err) {
      console.warn('Telegram API не настроен или не работает:', err)
      return err instanceof Error
        ? err.message
        : 'Не удалось отправить заявку. Попробуйте позже или напишите нам напрямую.'
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setApiError(null)
    setSuccess(false)
    const next: Record<string, string> = {}
    if (!isValidName(form.name)) next.name = 'Укажите имя'
    if (!isValidEmail(form.contact)) next.contact = 'Похоже, e-mail некорректен'
    if (form.track.trim().length < 3) next.track = 'Добавьте ссылку или название трека'
    setErrors(next)
    if (Object.keys(next).length > 0) return

    const packageTitle = services.find((s) => s.id === form.package)?.title ?? form.package

    setLoading(true)
    const errMsg = await submitToTelegram({
      name: form.name,
      email: form.contact,
      instrument: packageTitle,
      experience: `Трек: ${form.track}`,
      message: `Пакет: ${packageTitle}${form.comment ? `\nКомментарий: ${form.comment}` : ''}`,
      type: 'service',
      website: form.website,
    })
    if (errMsg) {
      setApiError(errMsg)
      setLoading(false)
      return
    }

    try {
      addSubmission({
        userId: user?.id,
        type: 'service',
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
      track: '',
      package: services[0].id,
      comment: '',
      website: '',
    })
  }

  const handleCoverSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCoverApiError(null)
    setCoverSuccess(false)
    const next: Record<string, string> = {}
    if (!isValidName(coverName)) next.name = 'Укажите имя'
    if (!isValidEmail(coverContact)) next.contact = 'Похоже, e-mail некорректен'
    if (coverTrack.trim().length < 3) next.track = 'Добавьте ссылку на оригинальный трек'
    if (coverStages.length === 0) next.stages = 'Выберите хотя бы один этап'
    setCoverErrors(next)
    if (Object.keys(next).length > 0) return

    const stageList = coverStages
      .map((id) => COVER_STAGES.find((s) => s.id === id)?.title)
      .filter(Boolean)
      .join(' → ')

    const priceNote = coverCalc.clamped
      ? `${coverCalc.total.toLocaleString('ru-RU')} ₽ (мин. заказ, выбрано этапов на ${coverCalc.raw.toLocaleString('ru-RU')} ₽)`
      : `${coverCalc.total.toLocaleString('ru-RU')} ₽`
    const overMaxNote = coverCalc.exceedsMax
      ? `\n⚠️ Сумма выбранных этапов (${coverCalc.raw.toLocaleString('ru-RU')} ₽) превышает обычный максимум — нужна доп. консультация, возможен отказ.`
      : ''

    setCoverLoading(true)
    const errMsg = await submitToTelegram({
      name: coverName,
      email: coverContact,
      instrument: 'Кавер (свой набор)',
      experience: `Трек: ${coverTrack}`,
      message:
        `Этапы: ${stageList || '—'}\n` +
        `Сумма: ${priceNote}${overMaxNote}` +
        (coverComment ? `\nКомментарий: ${coverComment}` : ''),
      type: 'cover',
      website: coverWebsite,
    })
    if (errMsg) {
      setCoverApiError(errMsg)
      setCoverLoading(false)
      return
    }

    try {
      addSubmission({
        userId: user?.id,
        type: 'cover',
        payload: {
          name: coverName,
          contact: coverContact,
          track: coverTrack,
          stages: coverStages.join(','),
          total: String(coverCalc.total),
          comment: coverComment,
        },
      })
    } catch (err) {
      console.warn('addSubmission failed (не критично):', err)
    }

    setCoverSuccess(true)
    setCoverLoading(false)
    setCoverName(user?.name ?? '')
    setCoverContact(user?.email ?? '')
    setCoverTrack('')
    setCoverStages(COVER_DEFAULT_STAGES)
    setCoverComment('')
    setCoverWebsite('')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      <div className="reveal reveal-1">
        <span className="tag"><Sparkles size={12} /> Услуги</span>
      </div>
      <h1 className="reveal reveal-2 mt-4 font-display text-5xl sm:text-7xl lg:text-8xl leading-[0.95]">
        Адаптация
        <br />
        <span className="text-fire">текстов</span> на русский
      </h1>
      <p className="reveal reveal-3 mt-6 max-w-2xl text-xl text-muted">
        Делаем из зарубежного трека живой русский хит. Не подстрочник — а
        песню, которую хочется петь.
      </p>

      <section className="mt-14">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
          <div>
            <div className="text-sm tracking-[0.3em] uppercase text-accent">
              Прайс
            </div>
            <h2 className="font-display text-4xl sm:text-5xl mt-1">
              Стоимость адаптации
            </h2>
          </div>
        </div>

        <div className="surface overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-border text-sm tracking-[0.3em] uppercase text-muted">
            <div className="col-span-12 sm:col-span-3">Размер</div>
            <div className="hidden sm:block sm:col-span-3">Длительность</div>
            <div className="col-span-7 sm:col-span-3">Стандарт</div>
            <div className="col-span-5 sm:col-span-3">Японский язык</div>
          </div>
          {priceTable.map((row, i) => (
            <div
              key={row.size}
              className={`grid grid-cols-12 gap-4 px-6 py-5 items-center reveal ${
                i !== priceTable.length - 1 ? 'border-b border-border' : ''
              }`}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="col-span-12 sm:col-span-3">
                <div className="font-display text-2xl leading-tight">{row.size}</div>
                <div className="sm:hidden text-sm text-muted mt-1">{row.duration}</div>
              </div>
              <div className="hidden sm:block sm:col-span-3 text-base text-muted">{row.duration}</div>
              <div className="col-span-7 sm:col-span-3 font-display text-2xl text-fire">{row.price}</div>
              <div className="col-span-5 sm:col-span-3 font-display text-2xl text-warm">{row.japanese}</div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-base text-muted">
          * Рекомендуемая цена на «японщину» действует для треков на японском языке и сложных лингвистических структурах.
        </p>
      </section>

      <section className="mt-16 grid gap-5 lg:grid-cols-2">
        <div className="surface p-7 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-fire flex items-center justify-center text-white shadow-glow">
              <Zap size={20} />
            </div>
            <div>
              <div className="text-sm tracking-[0.3em] uppercase text-accent">
                Срочные заказы
              </div>
              <h3 className="font-display text-3xl leading-tight">Готовность за 24 часа</h3>
            </div>
          </div>
          <p className="mt-5 text-lg text-muted leading-relaxed">
            Стоимость увеличивается в <span className="text-fire font-display text-2xl">2 раза (×2)</span>.
            Возможность срочного заказа зависит от загруженности команды —
            уточняйте перед оформлением.
          </p>
          <div className="mt-5 surface-soft p-4 flex items-start gap-3 text-base text-muted">
            <AlertCircle size={18} className="text-accent shrink-0 mt-0.5" />
            <span>
              Не все треки можно сделать за 24 часа — качество для нас важнее скорости.
            </span>
          </div>
        </div>

        <div className="surface p-7 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-fire flex items-center justify-center text-white shadow-glow">
              <Scale size={20} />
            </div>
            <div>
              <div className="text-sm tracking-[0.3em] uppercase text-accent">
                Факторы цены
              </div>
              <h3 className="font-display text-3xl leading-tight">Когда стоит выше</h3>
            </div>
          </div>
          <p className="mt-5 text-lg text-muted leading-relaxed">
            Цена может быть выше базовой, если песня имеет повышенную сложность:
          </p>
          <ul className="mt-5 grid gap-3 text-base">
            {factors.map((f) => (
              <li key={f.title} className="flex items-start gap-3">
                <span className="mt-2 w-2 h-2 rounded-full bg-fire shrink-0" />
                <div>
                  <span className="font-medium text-lg">{f.title}.</span>{' '}
                  <span className="text-muted">{f.text}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-20">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
          <div>
            <div className="text-sm tracking-[0.3em] uppercase text-accent">
              Каверы
            </div>
            <h2 className="font-display text-4xl sm:text-5xl mt-1">
              Кавер под ключ
            </h2>
          </div>
          <div className="flex items-center gap-2 text-base text-muted">
            <Mic2 size={16} /> От 3 000 до 10 000 ₽
          </div>
        </div>

        <p className="reveal reveal-1 mt-2 max-w-2xl text-lg text-muted">
          Шесть этапов — собирайте свой набор под бюджет. Итог считается
          автоматически в форме ниже.
        </p>

        <div className="reveal reveal-2 mt-8 surface overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-border text-sm tracking-[0.3em] uppercase text-muted">
            <div className="col-span-12 sm:col-span-3">Этап</div>
            <div className="hidden sm:block sm:col-span-7">Что входит</div>
            <div className="col-span-12 sm:col-span-2 sm:text-right">Цена</div>
          </div>
          {COVER_STAGES.map((stage, i) => {
            const Icon = STAGE_ICONS[stage.id]
            return (
              <div
                key={stage.id}
                className={`grid grid-cols-12 gap-4 px-6 py-5 items-start reveal ${
                  i !== COVER_STAGES.length - 1 ? 'border-b border-border' : ''
                }`}
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                <div className="col-span-12 sm:col-span-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-fireSoft flex items-center justify-center text-accent shrink-0">
                      <Icon size={16} />
                    </div>
                    <div>
                      <div className="text-[10px] tracking-[0.3em] uppercase text-muted">
                        Этап {String(i + 1).padStart(2, '0')}
                      </div>
                      <div className="font-display text-xl leading-tight mt-0.5">{stage.title}</div>
                    </div>
                  </div>
                </div>
                <div className="hidden sm:block sm:col-span-7 text-base text-muted leading-relaxed">
                  {stage.description}
                </div>
                <div className="col-span-12 sm:col-span-2 sm:text-right font-display text-2xl text-fire">
                  {stage.basePrice.toLocaleString('ru-RU')} ₽
                </div>
              </div>
            )
          })}
        </div>

        <div className="reveal reveal-3 mt-6 grid gap-3 sm:grid-cols-2">
          <div className="surface-soft p-5 flex items-start gap-3 text-base text-muted">
            <AlertCircle size={18} className="text-accent shrink-0 mt-0.5" />
            <span>
              Минимум <span className="text-fire font-medium">{COVER_MIN_PRICE.toLocaleString('ru-RU')} ₽</span> —
              даже на «голом» голосе работают вокалист, переводчик и тюнер.
            </span>
          </div>
          <div className="surface-soft p-5 flex items-start gap-3 text-base text-muted">
            <AlertCircle size={18} className="text-accent shrink-0 mt-0.5" />
            <span>
              Обычный потолок — <span className="text-fire font-medium">{COVER_MAX_PRICE.toLocaleString('ru-RU')} ₽</span>.
              Если трек окажется слишком сложным, оставляем за собой право отказаться.
            </span>
          </div>
        </div>
      </section>

      <section className="mt-16">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
          <div>
            <div className="text-sm tracking-[0.3em] uppercase text-accent">
              Условия
            </div>
            <h2 className="font-display text-4xl sm:text-5xl mt-1">
              Условия работы
            </h2>
          </div>
          <div className="flex items-center gap-2 text-base text-muted">
            <Hammer size={16} /> Нажмите, чтобы раскрыть
          </div>
        </div>

        <div className="grid gap-3">
          {conditions.map((c, i) => {
            const open = openCondition === i
            return (
              <div key={c.title} className="surface overflow-hidden reveal" style={{ animationDelay: `${i * 0.04}s` }}>
                <button
                  onClick={() => setOpenCondition(open ? null : i)}
                  className="w-full flex items-center justify-between gap-4 p-5 sm:p-6 text-left"
                >
                  <div>
                    <div className="text-sm tracking-[0.3em] uppercase text-accent mb-1">
                      Пункт {String(i + 1).padStart(2, '0')}
                    </div>
                    <h3 className="font-display text-3xl leading-tight">{c.title}</h3>
                  </div>
                  <div
                    className={`w-11 h-11 rounded-full bg-fireSoft flex items-center justify-center text-accent transition-transform ${
                      open ? 'rotate-180' : ''
                    }`}
                  >
                    <ChevronDown size={20} />
                  </div>
                </button>
                <div
                  className={`grid transition-all duration-500 ease-out ${
                    open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-1 text-lg text-muted leading-relaxed">
                      {c.text}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <div className="mt-20 grid gap-8 lg:grid-cols-12 items-start">
        <div className="lg:col-span-5">
          <h2 className="font-display text-4xl sm:text-5xl">Оставить заявку</h2>
          <p className="mt-4 text-lg text-muted max-w-md">
            Заполните короткую форму — мы свяжемся с вами в течение рабочего дня
            и обсудим детали.
          </p>
          <div className="mt-6 surface-soft p-5 text-base">
            <div className="text-sm tracking-[0.3em] uppercase text-muted mb-2">
              Как это работает
            </div>
            <ol className="grid gap-2 text-base">
              <li>1. Вы оставляете заявку и прикладываете ссылку на трек</li>
              <li>2. Мы изучаем материал и согласовываем стоимость</li>
              <li>3. Готовим адаптацию и согласовываем правки</li>
              <li>4. Передаём финальный текст</li>
            </ol>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="lg:col-span-7 surface p-7 sm:p-9 sticky top-24"
        >
          {success && (
            <div className="mb-6 surface-soft p-4 text-base flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-fire flex items-center justify-center text-white shrink-0">
                <Check size={16} strokeWidth={3} />
              </div>
              <div>
                <div className="font-medium">Заявка отправлена!</div>
                <div className="text-muted">Мы свяжемся с вами в ближайшее время по указанным контактам.</div>
              </div>
            </div>
          )}

          {apiError && (
            <div className="mb-6 surface-soft p-4 text-base flex items-start gap-3 border border-red-300/40">
              <div className="w-9 h-9 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 shrink-0">
                <AlertCircle size={16} />
              </div>
              <div>
                <div className="font-medium">Ошибка отправки</div>
                <div className="text-muted">{apiError}</div>
              </div>
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="text-sm tracking-[0.3em] uppercase text-muted">
                Имя
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Иван Петров"
                className="mt-2 text-base"
              />
              {errors.name && <p className="mt-1.5 text-sm text-accent">{errors.name}</p>}
            </div>
            <div>
              <label className="text-sm tracking-[0.3em] uppercase text-muted">
                E-mail или Telegram
              </label>
              <input
                value={form.contact}
                onChange={(e) => setForm({ ...form, contact: e.target.value })}
                placeholder="hello@example.com"
                className="mt-2 text-base"
              />
              {errors.contact && <p className="mt-1.5 text-sm text-accent">{errors.contact}</p>}
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm tracking-[0.3em] uppercase text-muted">
                Ссылка или название трека
              </label>
              <input
                value={form.track}
                onChange={(e) => setForm({ ...form, track: e.target.value })}
                placeholder="https://open.spotify.com/..."
                className="mt-2 text-base"
              />
              {errors.track && <p className="mt-1.5 text-sm text-accent">{errors.track}</p>}
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm tracking-[0.3em] uppercase text-muted">
                Пакет
              </label>
              <select
                value={form.package}
                onChange={(e) => setForm({ ...form, package: e.target.value })}
                className="mt-2 text-base"
              >
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title} — {s.price}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm tracking-[0.3em] uppercase text-muted">
                Комментарий
              </label>
              <textarea
                value={form.comment}
                onChange={(e) => setForm({ ...form, comment: e.target.value })}
                placeholder="Что важно учесть, какой вайб нужен..."
                className="mt-2 text-base"
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
          <button type="submit" disabled={loading} className="btn btn-primary mt-6 w-full sm:w-auto disabled:opacity-50">
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin mr-2" /> Отправка...
              </>
            ) : (
              <>
                Отправить заявку <ArrowUpRight size={14} />
              </>
            )}
          </button>
        </form>
      </div>

      <div id="cover-order" className="mt-24 grid gap-8 lg:grid-cols-12 items-start">
        <div className="lg:col-span-5">
          <div className="text-sm tracking-[0.3em] uppercase text-accent">
            Каверы
          </div>
          <h2 className="font-display text-4xl sm:text-5xl mt-2">Заказать кавер</h2>
          <p className="mt-4 text-lg text-muted max-w-md">
            Выберите пакет и пришлите ссылку на оригинальный трек. Мы оценим
            сложность и свяжемся с вами, чтобы обсудить детали.
          </p>
          <div className="mt-6 surface-soft p-5 text-base">
            <div className="text-sm tracking-[0.3em] uppercase text-muted mb-2">
              Как это работает
            </div>
            <ol className="grid gap-2 text-base">
              <li>1. Выбираете пакет и кидаете ссылку на трек</li>
              <li>2. Слушаем, оцениваем сложность, согласовываем цену</li>
              <li>3. Готовим кавер по выбранным этапам</li>
              <li>4. Согласовываем правки и передаём финал</li>
            </ol>
          </div>
        </div>

        <form
          onSubmit={handleCoverSubmit}
          className="lg:col-span-7 surface p-7 sm:p-9 sticky top-24"
        >
          {coverSuccess && (
            <div className="mb-6 surface-soft p-4 text-base flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-fire flex items-center justify-center text-white shrink-0">
                <Check size={16} strokeWidth={3} />
              </div>
              <div>
                <div className="font-medium">Заказ принят!</div>
                <div className="text-muted">Мы свяжемся с вами в ближайшее время и обсудим детали.</div>
              </div>
            </div>
          )}

          {coverApiError && (
            <div className="mb-6 surface-soft p-4 text-base flex items-start gap-3 border border-red-300/40">
              <div className="w-9 h-9 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 shrink-0">
                <AlertCircle size={16} />
              </div>
              <div>
                <div className="font-medium">Ошибка отправки</div>
                <div className="text-muted">{coverApiError}</div>
              </div>
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="text-sm tracking-[0.3em] uppercase text-muted">Имя</label>
              <input
                value={coverName}
                onChange={(e) => setCoverName(e.target.value)}
                placeholder="Иван Петров"
                className="mt-2 text-base"
              />
              {coverErrors.name && <p className="mt-1.5 text-sm text-accent">{coverErrors.name}</p>}
            </div>
            <div>
              <label className="text-sm tracking-[0.3em] uppercase text-muted">E-mail или Telegram</label>
              <input
                value={coverContact}
                onChange={(e) => setCoverContact(e.target.value)}
                placeholder="hello@example.com"
                className="mt-2 text-base"
              />
              {coverErrors.contact && <p className="mt-1.5 text-sm text-accent">{coverErrors.contact}</p>}
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm tracking-[0.3em] uppercase text-muted">Ссылка на оригинальный трек</label>
              <input
                value={coverTrack}
                onChange={(e) => setCoverTrack(e.target.value)}
                placeholder="https://youtube.com/... или Spotify"
                className="mt-2 text-base"
              />
              {coverErrors.track && <p className="mt-1.5 text-sm text-accent">{coverErrors.track}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="text-sm tracking-[0.3em] uppercase text-muted">
                Этапы ({coverStages.length})
              </label>
              <div className="mt-3 grid gap-2">
                {COVER_STAGES.map((stage) => {
                  const Icon = STAGE_ICONS[stage.id]
                  const checked = coverStages.includes(stage.id)
                  return (
                    <label
                      key={stage.id}
                      className={`flex items-center gap-3 p-3 sm:p-4 rounded-2xl border cursor-pointer transition-colors ${
                        checked
                          ? 'border-fire bg-fireSoft/40'
                          : 'border-border bg-surface-soft/40 hover:border-accent/40'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleStage(stage.id)}
                        className="sr-only"
                      />
                      <span
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          checked ? 'bg-fire text-white' : 'bg-fireSoft text-accent'
                        }`}
                      >
                        <Icon size={16} />
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-base font-medium leading-tight">{stage.title}</span>
                        <span className="block text-sm text-muted leading-snug mt-0.5">
                          {stage.description}
                        </span>
                      </span>
                      <span className="font-display text-xl text-fire shrink-0">
                        {stage.basePrice.toLocaleString('ru-RU')} ₽
                      </span>
                    </label>
                  )
                })}
              </div>
              {coverErrors.stages && (
                <p className="mt-1.5 text-sm text-accent">{coverErrors.stages}</p>
              )}
            </div>

            <div className="sm:col-span-2 surface-soft p-4 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <div className="text-sm tracking-[0.3em] uppercase text-muted">Итого</div>
                <div className="font-display text-4xl text-fire mt-1">
                  {coverCalc.total.toLocaleString('ru-RU')} ₽
                </div>
                {coverCalc.clamped && (
                  <div className="text-sm text-muted mt-1">
                    Минимальный заказ — {COVER_MIN_PRICE.toLocaleString('ru-RU')} ₽
                  </div>
                )}
                {coverCalc.exceedsMax && (
                  <div className="text-sm text-accent mt-1 flex items-start gap-1.5">
                    <AlertCircle size={14} className="mt-0.5 shrink-0" />
                    <span>
                      Сумма выбранных этапов превышает {COVER_MAX_PRICE.toLocaleString('ru-RU')} ₽ —
                      оставите заявку, обсудим отдельно. Возможен отказ.
                    </span>
                  </div>
                )}
              </div>
              <div className="text-sm text-muted text-right">
                <div>Выбрано этапов: {coverStages.length}</div>
                <div>Сумма без округления: {coverCalc.raw.toLocaleString('ru-RU')} ₽</div>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="text-sm tracking-[0.3em] uppercase text-muted">Комментарий</label>
              <textarea
                value={coverComment}
                onChange={(e) => setCoverComment(e.target.value)}
                placeholder="Какой вайб, особые пожелания, дедлайн..."
                className="mt-2 text-base"
              />
            </div>
            {/* Honeypot */}
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              value={coverWebsite}
              onChange={(e) => setCoverWebsite(e.target.value)}
              className="hidden"
              aria-hidden="true"
            />
          </div>
          <button
            type="submit"
            disabled={coverLoading}
            className="btn btn-primary mt-6 w-full sm:w-auto disabled:opacity-50"
          >
            {coverLoading ? (
              <>
                <Loader2 size={14} className="animate-spin mr-2" /> Отправка...
              </>
            ) : (
              <>
                Заказать кавер <ArrowUpRight size={14} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
