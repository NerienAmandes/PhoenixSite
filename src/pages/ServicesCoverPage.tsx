import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  COVER_MIN_PRICE,
  COVER_MAX_PRICE,
  COVER_DEFAULT_STAGES,
} from '../data/covers'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useAuthStore } from '../store/useAuthStore'
import { useSubmissionsStore } from '../store/useSubmissionsStore'
import { useYouTubePlaylist } from '../hooks/useYouTubePlaylist'
import {
  Check,
  ArrowUpRight,
  Sparkles,
  Mic2,
  AlertCircle,
  Loader2,
  PenLine,
  Sliders,
  Palette,
  Video,
  Youtube,
  Play,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { isValidEmail, isValidName } from '../utils/validators'
import { COVER_STAGES, type CoverStageId } from '../types'

const STAGE_ICONS: Record<CoverStageId, LucideIcon> = {
  lyrics: PenLine,
  vocal: Mic2,
  'back-vocal': Users,
  tuning: Sliders,
  mixing: Sliders,
  art: Palette,
  video: Video,
}

export default function ServicesCoverPage() {
  useDocumentTitle('Заказ кавера')
  const user = useAuthStore((s) => s.user)
  const addSubmission = useSubmissionsStore((s) => s.add)
  const { videos, loading: ytLoading, error: ytError } = useYouTubePlaylist()

  // Берём только каверы (не shorts и не live) — те, что уже выложены на канал.
  const examples = useMemo(() => videos.slice(0, 6), [videos])

  // Состояние формы
  const [coverStages, setCoverStages] = useState<CoverStageId[]>(COVER_DEFAULT_STAGES)
  const [coverComment, setCoverComment] = useState('')
  const [coverName, setCoverName] = useState(user?.name ?? '')
  const [coverContact, setCoverContact] = useState(user?.email ?? '')
  const [coverTrack, setCoverTrack] = useState('')
  const [coverWebsite, setCoverWebsite] = useState('')
  const [coverErrors, setCoverErrors] = useState<Record<string, string>>({})
  const [coverSuccess, setCoverSuccess] = useState(false)
  const [coverLoading, setCoverLoading] = useState(false)
  const [coverApiError, setCoverApiError] = useState<string | null>(null)

  // Автоподсчёт стоимости
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
        <span className="tag">
          <Mic2 size={12} /> Услуги · Кавер под ключ
        </span>
      </div>
      <h1 className="reveal reveal-2 mt-4 font-display text-5xl sm:text-7xl lg:text-8xl leading-[1.2]">
        Кавер
        <br />
        <span className="text-fire">под ключ</span>
      </h1>
      <p className="reveal reveal-3 mt-6 max-w-2xl text-xl text-muted">
        Шесть этапов — собирайте свой набор под бюджет. Итог считается
        автоматически в форме ниже.
      </p>

      <section className="mt-14">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
          <div>
            <div className="text-sm tracking-[0.3em] uppercase text-accent">
              Каталог этапов
            </div>
            <h2 className="font-display text-4xl sm:text-5xl mt-1">
              Что входит в кавер
            </h2>
          </div>
          <div className="flex items-center gap-2 text-base text-muted">
            <Mic2 size={16} /> От {COVER_MIN_PRICE.toLocaleString('ru-RU')} до {COVER_MAX_PRICE.toLocaleString('ru-RU')} ₽
          </div>
        </div>

        <div className="surface overflow-hidden">
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
              Итог корректируется от сложности трека. Если трек окажется
              слишком тяжёлым — обсудим отдельно, возможен отказ.
            </span>
          </div>
        </div>
      </section>

      <section className="mt-20">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
          <div>
            <div className="text-sm tracking-[0.3em] uppercase text-accent">
              Сроки
            </div>
            <h2 className="font-display text-4xl sm:text-5xl mt-1">
              Дедлайны по этапам
            </h2>
          </div>
        </div>

        <div className="surface relative overflow-hidden p-7 sm:p-9">
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-fire opacity-10 blur-3xl" />
          <div className="relative grid gap-6 lg:grid-cols-12 items-center">
            <div className="lg:col-span-5">
              <div className="text-sm tracking-[0.3em] uppercase text-accent">
                Полный цикл
              </div>
              <h3 className="font-display text-4xl sm:text-5xl leading-tight mt-1">
                Кавер от и до —
                <br />
                <span className="text-fire">~1 месяц</span>
              </h3>
              <p className="mt-4 text-lg text-muted leading-relaxed">
                Стандартный дедлайн на весь кавер целиком: от адаптации текста
                до финального файла. Считаем от старта работы, не от заявки.
              </p>
            </div>
            <div className="lg:col-span-7 grid gap-3 sm:grid-cols-2">
              {[
                { id: 'lyrics', icon: STAGE_ICONS.lyrics, title: 'Текст', period: 'от 3 дней до 1 недели' },
                { id: 'vocal', icon: STAGE_ICONS.vocal, title: 'Вокал', period: 'до 2 недель' },
                { id: 'back-vocal', icon: STAGE_ICONS['back-vocal'], title: 'Бэк-вокал', period: 'до 2 недель' },
                { id: 'art', icon: STAGE_ICONS.art, title: 'Арт', period: 'до 2 недель' },
                { id: 'video', icon: STAGE_ICONS.video, title: 'Видео', period: 'до 2 недель' },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <div
                    key={item.id}
                    className="surface-soft p-5 flex items-center gap-4"
                  >
                    <div className="w-11 h-11 rounded-xl bg-fire flex items-center justify-center text-white shrink-0">
                      <Icon size={18} />
                    </div>
                    <div>
                      <div className="text-sm tracking-[0.2em] uppercase text-muted">
                        {item.title}
                      </div>
                      <div className="font-display text-2xl text-fire leading-tight mt-0.5">
                        {item.period}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          <p className="relative mt-6 text-sm text-muted flex items-start gap-2">
            <AlertCircle size={16} className="text-accent shrink-0 mt-0.5" />
            <span>
              Тюнинг и сведение идут в общем сроке вокального этапа и отдельно
              не выделяются. Бэк-вокал считается вместе с основной записью.
              Срочные заказы обсуждаем индивидуально.
            </span>
          </p>
        </div>
      </section>

      <section className="mt-20">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
          <div>
            <div className="text-sm tracking-[0.3em] uppercase text-accent">
              Примеры
            </div>
            <h2 className="font-display text-4xl sm:text-5xl mt-1">
              Наши каверы
            </h2>
          </div>
          <Link to="/releases" className="btn btn-ghost">
            Все релизы <ArrowUpRight size={14} />
          </Link>
        </div>

        {ytLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={40} className="animate-spin text-fire" />
          </div>
        )}

        {ytError && (
          <div className="surface-soft p-5 text-base text-muted">
            Не удалось подгрузить плейлист — показываем заглушку. Откройте{' '}
            <a
              href="https://youtube.com/@firephoenix6297"
              target="_blank"
              rel="noreferrer"
              className="text-accent hover:underline"
            >
              наш YouTube
            </a>{' '}
            и оцените работы там.
          </div>
        )}

        {!ytLoading && !ytError && examples.length === 0 && (
          <div className="surface-soft p-6 text-center text-muted">
            В плейлисте пока нет видео. Скоро появятся первые каверы.
          </div>
        )}

        {!ytLoading && examples.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {examples.map((v, i) => (
              <a
                key={v.id}
                href={`https://www.youtube.com/watch?v=${v.youtubeId}`}
                target="_blank"
                rel="noreferrer"
                className="group surface overflow-hidden reveal hover:border-accent transition-colors"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="relative aspect-video bg-base overflow-hidden">
                  <img
                    src={
                      v.thumbnail ||
                      `https://i.ytimg.com/vi/${v.youtubeId}/hqdefault.jpg`
                    }
                    alt={v.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-90 group-hover:opacity-100 transition-opacity">
                    <div className="w-14 h-14 rounded-full bg-fire text-white flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform">
                      <Play size={22} fill="currentColor" />
                    </div>
                  </div>
                  <div className="absolute top-3 left-3">
                    <span className="tag backdrop-blur-md bg-black/40 text-white border-white/20 text-[10px]">
                      <Youtube size={10} />
                      Кавер
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="font-display text-xl leading-tight group-hover:text-accent transition-colors">
                    {v.title}
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>

      <div className="mt-20 grid gap-8 lg:grid-cols-12 items-start">
        <div className="lg:col-span-5">
          <h2 className="font-display text-4xl sm:text-5xl">Заказать кавер</h2>
          <p className="mt-4 text-lg text-muted max-w-md">
            Выберите набор этапов и пришлите ссылку на оригинальный трек. Мы
            оценим сложность и свяжемся с вами, чтобы обсудить детали.
          </p>
          <div className="mt-6 surface-soft p-5 text-base">
            <div className="text-sm tracking-[0.3em] uppercase text-muted mb-2">
              Как это работает
            </div>
            <ol className="grid gap-2 text-base">
              <li>1. Выбираете этапы и кидаете ссылку на трек</li>
              <li>2. Слушаем, оцениваем сложность, согласовываем цену</li>
              <li>3. Готовим кавер по выбранным этапам</li>
              <li>4. Согласовываем правки и передаём финал</li>
            </ol>
          </div>
          <div className="mt-5 surface-soft p-5 text-base flex items-start gap-3">
            <Sparkles size={18} className="text-accent shrink-0 mt-0.5" />
            <div>
              <div className="font-medium">Нужен только текст?</div>
              <div className="text-muted">
                Если вам нужна только лирика — закажите{' '}
                <Link to="/services/lyrics" className="text-accent hover:underline">
                  адаптацию текста
                </Link>{' '}
                на отдельной странице.
              </div>
            </div>
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
                      Сумма превышает обычный диапазон (от {COVER_MIN_PRICE.toLocaleString('ru-RU')} до {COVER_MAX_PRICE.toLocaleString('ru-RU')} ₽) —
                      оставьте заявку, обсудим индивидуально. Финальная цена
                      зависит от сложности трека.
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
