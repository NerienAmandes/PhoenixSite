import { useState } from 'react'
import { services } from '../data/services'
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
} from 'lucide-react'
import { isValidEmail, isValidName } from '../utils/validators'

const priceTable = [
  { size: 'TV-size', duration: 'до 2-х минут', price: 'от 500 ₽', japanese: 'от 700 ₽' },
  { size: 'Full-size', duration: 'от 2-х до 4-х минут', price: 'от 1 000 ₽', japanese: 'от 1 400 ₽' },
  { size: 'Длинные треки', duration: 'от 4-х минут', price: '+100 ₽ / мин', japanese: 'по стандартной сетке' },
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
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState(false)
  const [openCondition, setOpenCondition] = useState<number | null>(0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const next: Record<string, string> = {}
    if (!isValidName(form.name)) next.name = 'Укажите имя'
    if (!isValidEmail(form.contact)) next.contact = 'Похоже, e-mail некорректен'
    if (form.track.trim().length < 3) next.track = 'Добавьте ссылку или название трека'
    setErrors(next)
    if (Object.keys(next).length > 0) return

    addSubmission({
      userId: user?.id,
      type: 'service',
      payload: form,
    })
    setSuccess(true)
    setForm({ name: user?.name ?? '', contact: user?.email ?? '', track: '', package: services[0].id, comment: '' })
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
          </div>
          <button type="submit" className="btn btn-primary mt-6 w-full sm:w-auto">
            Отправить заявку <ArrowUpRight size={14} />
          </button>
        </form>
      </div>
    </div>
  )
}
