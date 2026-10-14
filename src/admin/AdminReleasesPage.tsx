import { useEffect, useMemo, useRef, useState } from 'react'
import { supabase, publicUrl } from '../lib/supabase'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { UPCOMING_STAGES } from '../components/ReleaseCard'
import {
  extractVideoId,
  fetchYouTubeMeta,
  thumbnailUrl,
  tryExtractOriginalArtist,
} from '../lib/youtube'
import {
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
  Upload,
  Image as ImageIcon,
  Wand2,
  Loader2,
} from 'lucide-react'

// ---------- типы ----------

type DbRelease = {
  id: string
  slug: string
  title: string
  original_artist: string | null
  cover_url: string | null
  release_date: string | null
  status: 'upcoming' | 'released'
  platforms: {
    spotify?: string
    youtube?: string
    yandex?: string
    apple?: string
  }
  description: string | null
  current_stage: number
  is_published: boolean
  original_language: string | null
}

type DbMemberLite = {
  id: string
  slug: string
  display_name: string
  avatar_path: string | null
  tags: string[]
  member_status?: string
}

type FormState = {
  slug: string
  title: string
  original_artist: string
  cover_path: string | null
  release_date: string // YYYY-MM-DD или пусто
  status: 'upcoming' | 'released'
  platforms: {
    spotify: string
    youtube: string
    yandex: string
    apple: string
  }
  description: string
  current_stage: number
  is_published: boolean
  /** Язык оригинала. Свободный текст (Korean, English, Japanese…). */
  original_language: string
  /** выбранные id участников (из public.members.id — это uuid) */
  creditMemberIds: Set<string>
}

const emptyForm: FormState = {
  slug: '',
  title: '',
  original_artist: '',
  cover_path: null,
  release_date: '',
  status: 'upcoming',
  platforms: { spotify: '', youtube: '', yandex: '', apple: '' },
  description: '',
  current_stage: 0,
  is_published: true,
  original_language: '',
  creditMemberIds: new Set(),
}

function formFromDb(r: DbRelease, creditIds: string[]): FormState {
  return {
    slug: r.slug,
    title: r.title,
    original_artist: r.original_artist ?? '',
    cover_path: r.cover_url,
    release_date: r.release_date ?? '',
    status: r.status,
    platforms: {
      spotify: r.platforms?.spotify ?? '',
      youtube: r.platforms?.youtube ?? '',
      yandex: r.platforms?.yandex ?? '',
      apple: r.platforms?.apple ?? '',
    },
    description: r.description ?? '',
    current_stage: r.current_stage ?? 0,
    is_published: r.is_published,
    original_language: r.original_language ?? '',
    creditMemberIds: new Set(creditIds),
  }
}

/**
 * Скачать YouTube-превью и загрузить в Supabase Storage.
 *
 * YouTube на не-maxres видео отдаёт плейсхолдер ~120x90 (~1-4КБ),
 * поэтому проверяем размер: если меньше 5КБ — это серая заглушка,
 * пробуем следующее качество.
 *
 * Возвращает локальный path (`covers/slug.jpg`) при успехе, иначе null.
 */
async function uploadYouTubeCoverToStorage(
  videoId: string,
  slug: string,
): Promise<{ path: string; size: number } | null> {
  const candidates = [
    thumbnailUrl(videoId, 'max'),
    thumbnailUrl(videoId, 'high'),
  ]
  const safeSlug = slug.replace(/[^a-z0-9-]/gi, '').toLowerCase() || `yt-${videoId}`

  for (const url of candidates) {
    try {
      const res = await fetch(url)
      if (!res.ok) continue
      const blob = await res.blob()
      // 5KB — отсечка для YouTube-плейсхолдера
      if (blob.size < 5000) continue
      const path = `covers/${safeSlug}.jpg`
      const { error } = await supabase.storage
        .from('media')
        .upload(path, blob, { upsert: true, contentType: 'image/jpeg' })
      if (error) {
        // Не фейлим весь процесс — обложка останется YouTube-ссылкой
        console.warn('Storage upload failed:', error.message)
        continue
      }
      return { path, size: blob.size }
    } catch {
      // сеть упала или CORS — пробуем следующее качество
    }
  }
  return null
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9а-яё]+/giu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64)
}

// ---------- страница ----------

type View =
  | { kind: 'list' }
  | { kind: 'create' }
  | { kind: 'edit'; id: string }

export default function AdminReleasesPage() {
  useDocumentTitle('Админка · Релизы')
  const [view, setView] = useState<View>({ kind: 'list' })
  const [releases, setReleases] = useState<DbRelease[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('releases')
      .select('*')
      .order('release_date', { ascending: false, nullsFirst: false })
    if (error) {
      setError(error.message)
      setReleases([])
    } else {
      setReleases((data ?? []) as DbRelease[])
    }
    setLoading(false)
  }

  useEffect(() => {
    if (view.kind === 'list') void load()
  }, [view.kind])

  if (view.kind === 'create') {
    return (
      <ReleaseForm
        initial={emptyForm}
        isNew
        onCancel={() => setView({ kind: 'list' })}
        onSaved={() => setView({ kind: 'list' })}
      />
    )
  }

  if (view.kind === 'edit') {
    const target = releases.find((r) => r.id === view.id)
    if (!target && !loading) {
      return (
        <div>
          <p className="text-accent">Релиз не найден.</p>
          <button className="btn mt-4" onClick={() => setView({ kind: 'list' })}>
            <X size={14} /> Назад к списку
          </button>
        </div>
      )
    }
    if (!target) {
      return <div className="text-muted text-sm">Загрузка…</div>
    }
    return (
      <ReleaseEditor
        release={target}
        onCancel={() => setView({ kind: 'list' })}
        onSaved={() => setView({ kind: 'list' })}
      />
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <h2 className="font-display text-2xl">Релизы ({releases.length})</h2>
        <button
          className="btn btn-primary text-sm"
          onClick={() => setView({ kind: 'create' })}
        >
          <Plus size={14} /> Добавить
        </button>
      </div>

      {error && (
        <div className="surface-soft text-sm text-accent p-3 mb-4">{error}</div>
      )}

      {loading ? (
        <div className="text-muted text-sm">Загрузка…</div>
      ) : releases.length === 0 ? (
        <div className="text-muted text-sm">Пока нет релизов.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-muted border-b border-border">
              <tr>
                <th className="py-2 pr-3 font-normal">Обложка</th>
                <th className="py-2 pr-3 font-normal">Название</th>
                <th className="py-2 pr-3 font-normal">Slug</th>
                <th className="py-2 pr-3 font-normal">Статус</th>
                <th className="py-2 pr-3 font-normal">Дата</th>
                <th className="py-2 pr-3 font-normal text-right">Действия</th>
              </tr>
            </thead>
            <tbody>
              {releases.map((r) => {
                const cover = publicUrl(r.cover_url)
                return (
                  <tr key={r.id} className="border-b border-border/60">
                    <td className="py-2 pr-3">
                      {cover ? (
                        <img
                          src={cover}
                          alt=""
                          className="w-12 h-12 rounded object-cover bg-deep"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded bg-deep flex items-center justify-center">
                          <ImageIcon size={16} className="text-muted" />
                        </div>
                      )}
                    </td>
                    <td className="py-2 pr-3">
                      <div className="font-medium">{r.title}</div>
                      {r.original_artist && (
                        <div className="text-xs text-muted">
                          оригинал: {r.original_artist}
                        </div>
                      )}
                    </td>
                    <td className="py-2 pr-3 font-mono text-xs">{r.slug}</td>
                    <td className="py-2 pr-3 text-xs">
                      {r.status === 'released' ? 'вышел' : 'готовится'}
                    </td>
                    <td className="py-2 pr-3 text-xs text-muted">
                      {r.release_date || '—'}
                    </td>
                    <td className="py-2 pr-3 text-right whitespace-nowrap">
                      <button
                        className="btn text-xs mr-2"
                        onClick={() => setView({ kind: 'edit', id: r.id })}
                      >
                        <Edit3 size={12} /> Изменить
                      </button>
                      <button
                        className="btn text-xs"
                        onClick={() => {
                          if (
                            window.confirm(
                              `Удалить «${r.title}»? Связи в release_credits тоже удалятся.`,
                            )
                          ) {
                            void supabase
                              .from('releases')
                              .delete()
                              .eq('id', r.id)
                              .then(({ error }) => {
                                if (error) {
                                  window.alert('Ошибка: ' + error.message)
                                } else {
                                  void load()
                                }
                              })
                          }
                        }}
                      >
                        <Trash2 size={12} /> Удалить
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ---------- редактор (нужны release + credits + members) ----------

function ReleaseEditor({
  release,
  onCancel,
  onSaved,
}: {
  release: DbRelease
  onCancel: () => void
  onSaved: () => void
}) {
  const [creditIds, setCreditIds] = useState<string[]>([])
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      const { data, error } = await supabase
        .from('release_credits')
        .select('member_id')
        .eq('release_id', release.id)
      if (cancelled) return
      if (error) {
        setError(error.message)
        setCreditIds([])
      } else {
        setCreditIds((data ?? []).map((r) => r.member_id as string))
      }
      setLoaded(true)
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [release.id])

  if (!loaded) {
    return <div className="text-muted text-sm">Загрузка…</div>
  }
  if (error) {
    return <div className="text-accent text-sm">{error}</div>
  }

  return (
    <ReleaseForm
      initial={formFromDb(release, creditIds)}
      isNew={false}
      releaseId={release.id}
      wasReleased={release.status === 'released'}
      onCancel={onCancel}
      onSaved={onSaved}
    />
  )
}

// ---------- форма ----------

function ReleaseForm({
  initial,
  isNew,
  releaseId,
  wasReleased: initialWasReleased = false,
  onCancel,
  onSaved,
}: {
  initial: FormState
  isNew: boolean
  releaseId?: string
  /** Был ли релиз уже в статусе released ДО редактирования. Используется,
   * чтобы не слать повторные уведомления подписчикам при правке старого. */
  wasReleased?: boolean
  onCancel: () => void
  onSaved: () => void
}) {
  const [form, setForm] = useState<FormState>(initial)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Аватарки, которые не загрузились (битый URL или файла нет в Storage).
  // Используем Set, чтобы не падать в ререндер при onError.
  const [brokenAvatars, setBrokenAvatars] = useState<Set<string>>(new Set())

  // Список участников для multi-select credits.
  const [members, setMembers] = useState<DbMemberLite[]>([])
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      const { data } = await supabase
        .from('members')
        .select('id, slug, display_name, avatar_path, tags, member_status')
        .eq('member_status', 'active')
        .order('display_name')
      if (!cancelled) setMembers((data ?? []) as DbMemberLite[])
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const membersById = useMemo(() => {
    const m = new Map<string, DbMemberLite>()
    for (const x of members) m.set(x.id, x)
    return m
  }, [members])

  // ===== YouTube автозаполнение =====
  // Дебаунс: ждём 700мс после последнего ввода URL,
  // потом дёргаем oEmbed и подставляем title + обложку.
  const [youtubeParsing, setYoutubeParsing] = useState(false)
  const [youtubeCoverSaving, setYoutubeCoverSaving] = useState(false)
  const [youtubeNote, setYoutubeNote] = useState<string | null>(null)
  const lastParsedVideoIdRef = useRef<string | null>(null)

  useEffect(() => {
    const url = form.platforms.youtube.trim()
    const videoId = extractVideoId(url)
    if (!videoId) {
      setYoutubeNote(null)
      lastParsedVideoIdRef.current = null
      return
    }
    // уже парсили этот ролик — не дёргаем повторно
    if (lastParsedVideoIdRef.current === videoId) return
    if (url.length < 10) return

    const timer = window.setTimeout(async () => {
      setYoutubeParsing(true)
      setYoutubeNote(null)
      try {
        const meta = await fetchYouTubeMeta(url)
        lastParsedVideoIdRef.current = meta.videoId
        // Чтобы прелоадер обложки не висел слишком долго,
        // фиксируем «виртуальный» slug сразу, до окончания парсинга.
        const optimisticSlug =
          slugify(meta.title) || `yt-${meta.videoId}`
        setForm((f) => {
          const next: FormState = { ...f }
          // 1) title — только если пустой (не затираем ручной ввод)
          if (!f.title.trim() && meta.title) {
            next.title = meta.title
            if (!f.slug || f.slug === slugify(f.title)) {
              next.slug = optimisticSlug
            }
          }
          // 2) original_artist — пробуем вытащить из title, если пустой
          if (!f.original_artist.trim()) {
            const guessed = tryExtractOriginalArtist(meta.title)
            if (guessed) next.original_artist = guessed
          }
          // 3) обложка: ставим YouTube-превью как мгновенный показ,
          //    параллельно качаем его в Supabase Storage
          if (!f.cover_path) {
            next.cover_path = thumbnailUrl(meta.videoId, 'max')
            setYoutubeCoverSaving(true)
            void uploadYouTubeCoverToStorage(meta.videoId, f.slug || optimisticSlug).then(
              (result) => {
                setYoutubeCoverSaving(false)
                if (result) {
                  setForm((ff) => ({ ...ff, cover_path: result.path }))
                  setYoutubeNote(
                    (prev) =>
                      `${prev ?? "Подтянуто с YouTube"} · обложка сохранена в Storage (${Math.round(result.size / 1024)} КБ)`,
                  )
                }
              },
            )
          }
          return next
        })
        setYoutubeNote(
          `Подтянуто с YouTube: «${meta.title}». Обложку можно заменить кнопкой «Загрузить файл».`,
        )
      } catch (e) {
        setYoutubeNote(
          e instanceof Error ? e.message : 'Не удалось получить данные с YouTube',
        )
      } finally {
        setYoutubeParsing(false)
      }
    }, 700)

    return () => window.clearTimeout(timer)
  }, [form.platforms.youtube])

  // ===== Копирование credits из других релизов =====
  const [donors, setDonors] = useState<DbRelease[]>([])
  const [donorId, setDonorId] = useState<string>('')
  const [copyBusy, setCopyBusy] = useState(false)
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      const { data } = await supabase
        .from('releases')
        .select('id, slug, title, original_artist, cover_url, release_date, status, platforms, description, current_stage, is_published, original_language')
        .order('release_date', { ascending: false, nullsFirst: false })
        .limit(50)
      if (!cancelled) setDonors((data ?? []) as DbRelease[])
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const copyCreditsFrom = async (releaseId: string) => {
    if (!releaseId) return
    setCopyBusy(true)
    setError(null)
    const { data, error } = await supabase
      .from('release_credits')
      .select('member_id')
      .eq('release_id', releaseId)
    setCopyBusy(false)
    if (error) {
      setError('Не удалось скопировать credits: ' + error.message)
      return
    }
    const ids = new Set<string>((data ?? []).map((r) => r.member_id as string))
    setForm((f) => ({ ...f, creditMemberIds: ids }))
  }

  // Пресеты по тегам (быстро добавить всю категорию)
  const PRESET_TAGS = useMemo(() => {
    const all = new Set<string>()
    for (const m of members) for (const t of m.tags) all.add(t)
    // Фиксируем порядок как в MEMBER_CATEGORIES
    const order = ['Вокалисты', 'Звукари', 'Художники', 'Видеомонтажёры', 'Переводчики', 'Администрация']
    const sorted: string[] = []
    for (const o of order) if (all.has(o)) sorted.push(o)
    for (const t of all) if (!sorted.includes(t)) sorted.push(t)
    return sorted
  }, [members])

  const membersByTag = useMemo(() => {
    const map = new Map<string, DbMemberLite[]>()
    for (const m of members) {
      for (const t of m.tags) {
        const arr = map.get(t) ?? []
        arr.push(m)
        map.set(t, arr)
      }
    }
    return map
  }, [members])

  const applyPreset = (tag: string, mode: 'add' | 'replace' | 'remove') => {
    const tagMembers = membersByTag.get(tag) ?? []
    setForm((f) => {
      const next = new Set(f.creditMemberIds)
      for (const m of tagMembers) {
        if (mode === 'add') next.add(m.id)
        else if (mode === 'replace') next.add(m.id)
        else next.delete(m.id)
      }
      if (mode === 'replace') {
        // убираем тех, кто НЕ в этом пресете — по сути «оставить только эту группу»
        for (const m of members) {
          if (!tagMembers.includes(m)) next.delete(m.id)
        }
      }
      return { ...f, creditMemberIds: next }
    })
  }

  const selectAllMembers = () => {
    setForm((f) => ({ ...f, creditMemberIds: new Set(members.map((m) => m.id)) }))
  }
  const clearAllMembers = () => {
    setForm((f) => ({ ...f, creditMemberIds: new Set() }))
  }

  const [slugTouched, setSlugTouched] = useState(!isNew)
  useEffect(() => {
    if (!isNew || slugTouched) return
    setForm((f) => ({ ...f, slug: slugify(f.title) }))
  }, [form.title, isNew, slugTouched])

  const onPickCover = async (file: File) => {
    if (!form.slug) {
      setError('Сначала задай slug — файл сохранится в covers/{slug}.{ext}')
      return
    }
    setUploading(true)
    setError(null)
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const path = `covers/${form.slug}.${ext}`
    const { error: upErr } = await supabase.storage
      .from('media')
      .upload(path, file, { upsert: true, contentType: file.type })
    if (upErr) {
      setError('Не удалось загрузить обложку: ' + upErr.message)
    } else {
      setForm((f) => ({ ...f, cover_path: path }))
    }
    setUploading(false)
  }

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!form.title.trim()) {
      setError('Название обязательно')
      return
    }
    if (!form.slug.trim()) {
      setError('Slug обязателен')
      return
    }
    if (form.release_date && !/^\d{4}-\d{2}-\d{2}$/.test(form.release_date)) {
      setError('Дата должна быть в формате YYYY-MM-DD')
      return
    }

    const platforms = {
      spotify: form.platforms.spotify.trim() || undefined,
      youtube: form.platforms.youtube.trim() || undefined,
      yandex: form.platforms.yandex.trim() || undefined,
      apple: form.platforms.apple.trim() || undefined,
    }

    const payload = {
      slug: form.slug.trim(),
      title: form.title.trim(),
      original_artist: form.original_artist.trim() || null,
      cover_url: form.cover_path,
      release_date: form.release_date || null,
      status: form.status,
      platforms,
      description: form.description.trim() || null,
      current_stage: Number(form.current_stage) || 0,
      is_published: form.is_published,
      original_language: form.original_language.trim() || null,
    }

    setSaving(true)

    // Запоминаем, был ли это уже released — чтобы решить, слать ли уведомления.
    // (Для редактирования старого released-релиза рассылку не делаем —
    // иначе подписчики получат «новый релиз» каждый раз при правке.)
    const wasReleased = !isNew && initialWasReleased

    // 1) upsert release
    const { data: upserted, error: upErr } = await supabase
      .from('releases')
      .upsert(payload, { onConflict: 'slug' })
      .select('id')
      .single()
    if (upErr || !upserted) {
      setSaving(false)
      setError(upErr?.message ?? 'Не удалось сохранить релиз')
      return
    }
    const newReleaseId: string = upserted.id

    // 2) Пересоздаём credits. Сначала удаляем старые.
    const { error: delErr } = await supabase
      .from('release_credits')
      .delete()
      .eq('release_id', newReleaseId)
    if (delErr) {
      setSaving(false)
      setError('Релиз сохранён, но не удалось очистить credits: ' + delErr.message)
      return
    }

    // 3) Вставляем новые.
    const creditRows = Array.from(form.creditMemberIds).map((memberId) => ({
      release_id: newReleaseId,
      member_id: memberId,
      role_label: null,
    }))
    if (creditRows.length > 0) {
      const { error: insErr } = await supabase
        .from('release_credits')
        .insert(creditRows)
      if (insErr) {
        setSaving(false)
        setError('Релиз сохранён, но не удалось сохранить credits: ' + insErr.message)
        return
      }
    }

    // 4) Если это новый released-релиз и он опубликован — шлём уведомления
    // подписчикам Telegram-бота. Не критично: при ошибке логируем, но
    // закрываем форму как обычно (релиз-то уже сохранён).
    const isFreshlyPublished = !wasReleased && form.status === 'released' && form.is_published
    if (isFreshlyPublished) {
      try {
        const secret = (import.meta.env.VITE_NOTIFY_SECRET as string | undefined) ?? ''
        if (secret) {
          void fetch('/api/notify-new-release', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-notify-secret': secret,
            },
            body: JSON.stringify({ releaseId: newReleaseId }),
          }).catch((err) => {
            console.warn('Не удалось отправить уведомления о релизе:', err)
          })
        } else {
          console.warn(
            'VITE_NOTIFY_SECRET не задан — пропускаем рассылку. ' +
              'Добавь env-переменную в .env.local и в Vercel, чтобы включить.',
          )
        }
      } catch (err) {
        console.warn('notify-new-release failed:', err)
      }
    }

    setSaving(false)
    onSaved()
  }

  const cover = form.cover_path
    ? form.cover_path.startsWith('http')
      ? form.cover_path
      : publicUrl(form.cover_path)
    : null
  const coverIsYouTube = !!cover && cover.startsWith('https://img.youtube.com/')

  return (
    <form onSubmit={onSave} className="grid gap-4 max-w-3xl">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl">
          {isNew ? 'Новый релиз' : `Редактирование: ${form.title}`}
        </h2>
        <button type="button" className="btn text-sm" onClick={onCancel}>
          <X size={14} /> Отмена
        </button>
      </div>

      {error && (
        <div className="surface-soft text-sm text-accent p-3">{error}</div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] tracking-[0.3em] uppercase text-muted">
            Название *
          </label>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="mt-2"
            required
          />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label className="text-[10px] tracking-[0.3em] uppercase text-muted">
              Slug *
            </label>
            {!slugTouched && isNew && (
              <span className="text-[10px] tracking-wider uppercase text-accent">
                авто
              </span>
            )}
          </div>
          <input
            value={form.slug}
            onChange={(e) => {
              setSlugTouched(true)
              setForm({ ...form, slug: e.target.value })
            }}
            className="mt-2 font-mono text-sm"
            placeholder="например: shadow-shadow"
            required
          />
          <div className="text-xs text-muted mt-1 leading-relaxed">
            Латиницей, без пробелов. Используется в адресе страницы:{' '}
            <span className="font-mono text-ink">
              /releases/{form.slug || '...'}
            </span>
            .
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] tracking-[0.3em] uppercase text-muted">
            Оригинальный исполнитель
          </label>
          <input
            value={form.original_artist}
            onChange={(e) =>
              setForm({ ...form, original_artist: e.target.value })
            }
            className="mt-2"
          />
        </div>
        <div>
          <label className="text-[10px] tracking-[0.3em] uppercase text-muted">
            Дата релиза (YYYY-MM-DD)
          </label>
          <input
            type="date"
            value={form.release_date}
            onChange={(e) => setForm({ ...form, release_date: e.target.value })}
            className="mt-2"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] tracking-[0.3em] uppercase text-muted">
            Язык оригинала
          </label>
          <input
            value={form.original_language}
            onChange={(e) =>
              setForm({ ...form, original_language: e.target.value })
            }
            className="mt-2"
            placeholder="например: Korean, English, Japanese"
            list="common-languages"
          />
          <datalist id="common-languages">
            <option value="Korean" />
            <option value="Japanese" />
            <option value="English" />
            <option value="Spanish" />
            <option value="Chinese" />
            <option value="Russian" />
            <option value="French" />
            <option value="German" />
          </datalist>
          <div className="text-xs text-muted mt-1">
            Используется для фильтра на странице «Релизы». Пусто — язык не указан.
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] tracking-[0.3em] uppercase text-muted">
            Статус
          </label>
          <select
            value={form.status}
            onChange={(e) =>
              setForm({ ...form, status: e.target.value as 'upcoming' | 'released' })
            }
            className="mt-2"
          >
            <option value="upcoming">Готовится (upcoming)</option>
            <option value="released">Вышел (released)</option>
          </select>
        </div>
        <div>
          <label className="text-[10px] tracking-[0.3em] uppercase text-muted">
            Этап производства
          </label>
          <select
            value={form.current_stage}
            onChange={(e) =>
              setForm({ ...form, current_stage: Number(e.target.value) })
            }
            className="mt-2"
          >
            {UPCOMING_STAGES.map((stage, idx) => (
              <option key={idx} value={idx}>
                {idx}. {stage}
              </option>
            ))}
          </select>
          <div className="text-xs text-muted mt-1">
            {UPCOMING_STAGES[form.current_stage] ?? '—'} ·{' '}
            {form.current_stage + 1} / {UPCOMING_STAGES.length}
          </div>
        </div>
      </div>

      <div>
        <label className="text-[10px] tracking-[0.3em] uppercase text-muted">
          Описание
        </label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="mt-2 min-h-[100px]"
        />
      </div>

      <div className="surface-soft p-4">
        <label className="text-[10px] tracking-[0.3em] uppercase text-muted">
          Обложка
        </label>
        <div className="mt-2 flex items-center gap-4">
          {cover ? (
            <img
              src={cover}
              alt=""
              className="w-24 h-24 rounded object-cover bg-deep"
            />
          ) : (
            <div className="w-24 h-24 rounded bg-deep flex items-center justify-center text-muted">
              <ImageIcon size={20} />
            </div>
          )}
          <div className="flex-1">
            <label className="btn text-sm cursor-pointer">
              <Upload size={14} />
              {uploading ? 'Загружаем…' : 'Загрузить файл'}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                disabled={uploading}
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) void onPickCover(f)
                }}
              />
            </label>
            {form.cover_path && (
              <div className="text-xs text-muted mt-2 font-mono break-all">
                {form.cover_path}
              </div>
            )}
            {coverIsYouTube && (
              <div className="text-xs text-accent mt-2">
                Превью подтянуто с YouTube. Нажми «Загрузить файл», чтобы заменить.
              </div>
            )}
          </div>
        </div>
      </div>

      <div>
        <label className="text-[10px] tracking-[0.3em] uppercase text-muted">
          Площадки (ссылки)
        </label>
        <div className="grid sm:grid-cols-2 gap-3 mt-2">
          <input
            value={form.platforms.spotify}
            onChange={(e) =>
              setForm({
                ...form,
                platforms: { ...form.platforms, spotify: e.target.value },
              })
            }
            placeholder="Spotify"
          />
          <input
            value={form.platforms.youtube}
            onChange={(e) =>
              setForm({
                ...form,
                platforms: { ...form.platforms, youtube: e.target.value },
              })
            }
            placeholder="YouTube"
          />
          {form.platforms.youtube && (
            <div className="col-span-2 -mt-1 flex items-center gap-2 text-xs text-muted">
              {youtubeParsing ? (
                <>
                  <Loader2 size={12} className="animate-spin" />
                  <span>Парсим YouTube…</span>
                </>
              ) : youtubeCoverSaving ? (
                <>
                  <Loader2 size={12} className="animate-spin" />
                  <span>Сохраняем обложку в Storage…</span>
                </>
              ) : youtubeNote ? (
                <span className="text-accent">{youtubeNote}</span>
              ) : null}
            </div>
          )}
          <input
            value={form.platforms.yandex}
            onChange={(e) =>
              setForm({
                ...form,
                platforms: { ...form.platforms, yandex: e.target.value },
              })
            }
            placeholder="Яндекс Музыка"
          />
          <input
            value={form.platforms.apple}
            onChange={(e) =>
              setForm({
                ...form,
                platforms: { ...form.platforms, apple: e.target.value },
              })
            }
            placeholder="Apple Music"
          />
        </div>
      </div>

      <div className="surface-soft p-4">
        <label className="text-[10px] tracking-[0.3em] uppercase text-muted">
          Участники релиза (credits)
        </label>
        <div className="mt-2 text-xs text-muted mb-3">
          Кликни на таблетку, чтобы добавить или убрать. Выбрано:{' '}
          {form.creditMemberIds.size}.
        </div>

        {/* Панель быстрого заполнения */}
        <div className="mb-4 p-3 rounded ring-1 ring-border bg-deep/40 space-y-3">
          <div className="flex items-center gap-2 text-[10px] tracking-[0.25em] uppercase text-muted">
            <Wand2 size={12} /> Быстрое заполнение
          </div>

          {/* Копирование из другого релиза */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={donorId}
              onChange={(e) => setDonorId(e.target.value)}
              className="text-sm py-1 max-w-xs"
              disabled={copyBusy}
            >
              <option value="">— Скопировать из релиза… —</option>
              {donors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title}
                  {d.original_artist ? ` (${d.original_artist})` : ''}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="btn text-xs"
              disabled={!donorId || copyBusy}
              onClick={() => void copyCreditsFrom(donorId)}
            >
              {copyBusy ? 'Копируем…' : 'Вставить'}
            </button>
          </div>

          {/* Пресеты по тегам */}
          {PRESET_TAGS.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {PRESET_TAGS.map((tag) => {
                const count = (membersByTag.get(tag) ?? []).length
                return (
                  <div
                    key={tag}
                    className="flex items-center gap-1 rounded-full bg-elevated ring-1 ring-border text-xs"
                  >
                    <span className="pl-3 pr-1 py-1 text-ink">{tag} ({count})</span>
                    <button
                      type="button"
                      title={`Только ${tag} (заменит выбор)`}
                      className="px-2 py-1 hover:bg-accent hover:text-bg rounded-r-full"
                      onClick={() => applyPreset(tag, 'replace')}
                    >
                      только
                    </button>
                    <button
                      type="button"
                      title={`Добавить всех из «${tag}»`}
                      className="px-2 py-1 hover:bg-accent hover:text-bg border-l border-border"
                      onClick={() => applyPreset(tag, 'add')}
                    >
                      +добавить
                    </button>
                    <button
                      type="button"
                      title={`Убрать всех из «${tag}»`}
                      className="px-2 py-1 hover:bg-accent hover:text-bg border-l border-border rounded-r-full"
                      onClick={() => applyPreset(tag, 'remove')}
                    >
                      −убрать
                    </button>
                  </div>
                )
              })}
              <div className="ml-auto flex gap-1">
                <button
                  type="button"
                  className="btn text-xs"
                  onClick={selectAllMembers}
                  disabled={form.creditMemberIds.size === members.length}
                >
                  Все
                </button>
                <button
                  type="button"
                  className="btn text-xs"
                  onClick={clearAllMembers}
                  disabled={form.creditMemberIds.size === 0}
                >
                  Снять
                </button>
              </div>
            </div>
          )}
        </div>

        {members.length === 0 ? (
          <div className="text-muted text-sm">Загружаем участников…</div>
        ) : (
          <div className="flex flex-wrap gap-2 max-h-80 overflow-y-auto pr-1">
            {members.map((m) => {
              const checked = form.creditMemberIds.has(m.id)
              const avatar = publicUrl(m.avatar_path)
              const showAvatar = avatar && !brokenAvatars.has(m.id)
              return (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => {
                    setForm((f) => {
                      const next = new Set(f.creditMemberIds)
                      if (checked) next.delete(m.id)
                      else next.add(m.id)
                      return { ...f, creditMemberIds: next }
                    })
                  }}
                  className={
                    'flex items-center gap-2 pl-1 pr-3 py-1 rounded-full text-sm transition ' +
                    (checked
                      ? 'bg-accent text-bg ring-1 ring-accent'
                      : 'bg-elevated text-ink hover:bg-deep ring-1 ring-border')
                  }
                >
                  {showAvatar ? (
                    <img
                      src={avatar}
                      alt=""
                      className="w-6 h-6 rounded-full object-cover"
                      onError={() => {
                        setBrokenAvatars((prev) => {
                          if (prev.has(m.id)) return prev
                          const next = new Set(prev)
                          next.add(m.id)
                          return next
                        })
                      }}
                    />
                  ) : (
                    <span
                      className={
                        'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium ' +
                        (checked ? 'bg-bg text-accent' : 'bg-deep text-muted')
                      }
                    >
                      {m.display_name?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                  )}
                  <span className="whitespace-nowrap">{m.display_name}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.is_published}
          onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
        />
        Опубликован (виден на публичных страницах)
      </label>

      <div className="flex gap-2">
        <button type="submit" className="btn btn-primary" disabled={saving}>
          <Save size={14} /> {saving ? 'Сохраняем…' : 'Сохранить'}
        </button>
        <button type="button" className="btn" onClick={onCancel}>
          Отмена
        </button>
      </div>

      {/* releaseId может пригодиться в будущем (например, для preview) */}
      {releaseId && <input type="hidden" value={releaseId} />}
    </form>
  )
}
