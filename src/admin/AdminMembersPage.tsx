import { useEffect, useState } from 'react'
import { supabase, publicUrl } from '../lib/supabase'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { Plus, Trash2, Edit3, Save, X, Upload, Image as ImageIcon } from 'lucide-react'

// ---------- типы, соответствующие колонкам БД ----------

type DbMember = {
  id: string
  slug: string
  display_name: string
  role: string | null
  tags: string[]
  birth_mmdd: string | null
  bio: string | null
  avatar_path: string | null
  socials: {
    vk?: string
    telegram?: string
    instagram?: string
    youtube?: string
  }
  is_published: boolean
  member_status: 'active' | 'former' | 'hidden' // <-- ДОБАВЛЕНО
}

type FormState = {
  slug: string
  display_name: string
  role: string
  tagsText: string // редактируем как строка через запятую
  birth_mmdd: string
  bio: string
  avatar_path: string | null
  socials: {
    vk: string
    telegram: string
    instagram: string
    youtube: string
  }
  is_published: boolean
  member_status: 'active' | 'former' | 'hidden' // <-- ДОБАВЛЕНО
}

const emptyForm: FormState = {
  slug: '',
  display_name: '',
  role: '',
  tagsText: '',
  birth_mmdd: '',
  bio: '',
  avatar_path: null,
  socials: { vk: '', telegram: '', instagram: '', youtube: '' },
  is_published: true,
  member_status: 'active', // <-- ДОБАВЛЕНО
}

function formFromDb(m: DbMember): FormState {
  return {
    slug: m.slug,
    display_name: m.display_name,
    role: m.role ?? '',
    tagsText: (m.tags ?? []).join(', '),
    birth_mmdd: m.birth_mmdd ?? '',
    bio: m.bio ?? '',
    avatar_path: m.avatar_path,
    socials: {
      vk: m.socials?.vk ?? '',
      telegram: m.socials?.telegram ?? '',
      instagram: m.socials?.instagram ?? '',
      youtube: m.socials?.youtube ?? '',
    },
    is_published: m.is_published,
    member_status: m.member_status || 'active', // <-- ДОБАВЛЕНО
  }
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9а-яё]+/giu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64)
}

function isValidBirthDdMm(s: string): boolean {
  if (!s) return true // пустое допустимо
  return /^(\d{2})\.(\d{2})$/.test(s)
}

// ---------- страница ----------

type View =
  | { kind: 'list' }
  | { kind: 'create' }
  | { kind: 'edit'; slug: string }

export default function AdminMembersPage() {
  useDocumentTitle('Админка · Участники')
  const [view, setView] = useState<View>({ kind: 'list' })
  const [members, setMembers] = useState<DbMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('display_name', { ascending: true })
    if (error) {
      setError(error.message)
      setMembers([])
    } else {
      setMembers((data ?? []) as DbMember[])
    }
    setLoading(false)
  }

  useEffect(() => {
    if (view.kind === 'list') void load()
  }, [view.kind])

  if (view.kind === 'create') {
    return (
      <MemberForm
        initial={emptyForm}
        isNew
        onCancel={() => setView({ kind: 'list' })}
        onSaved={() => setView({ kind: 'list' })}
      />
    )
  }

  if (view.kind === 'edit') {
    const target = members.find((m) => m.slug === view.slug)
    if (!target && !loading) {
      return (
        <div>
          <p className="text-accent">Участник не найден.</p>
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
      <MemberForm
        initial={formFromDb(target)}
        isNew={false}
        onCancel={() => setView({ kind: 'list' })}
        onSaved={() => setView({ kind: 'list' })}
      />
    )
  }

  // ---- список ----
  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <h2 className="font-display text-2xl">Участники ({members.length})</h2>
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
      ) : members.length === 0 ? (
        <div className="text-muted text-sm">Пока никого нет.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-muted border-b border-border">
              <tr>
                <th className="py-2 pr-3 font-normal">Имя</th>
                <th className="py-2 pr-3 font-normal">Slug</th>
                <th className="py-2 pr-3 font-normal">Теги</th>
                <th className="py-2 pr-3 font-normal">Статус</th>
                <th className="py-2 pr-3 font-normal text-right">Действия</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => {
                const avatar = publicUrl(m.avatar_path)
                return (
                  <tr key={m.id} className="border-b border-border/60">
                    <td className="py-2 pr-3">
                      <div className="flex items-center gap-3">
                        {avatar ? (
                          <img
                            src={avatar}
                            alt=""
                            className="w-8 h-8 rounded-full object-cover bg-deep"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-deep flex items-center justify-center">
                            <ImageIcon size={14} className="text-muted" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium">{m.display_name}</div>
                          {m.role && (
                            <div className="text-xs text-muted">{m.role}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-2 pr-3 font-mono text-xs">{m.slug}</td>
                    <td className="py-2 pr-3 text-xs text-muted">
                      {m.tags?.join(', ') || '—'}
                    </td>
                    <td className="py-2 pr-3 text-xs">
                      {m.member_status === 'active' && 'Активный'}
                      {m.member_status === 'former' && 'Бывший'}
                      {m.member_status === 'hidden' && 'Скрыт'}
                    </td>
                    <td className="py-2 pr-3 text-right whitespace-nowrap">
                      <button
                        className="btn text-xs mr-2"
                        onClick={() => setView({ kind: 'edit', slug: m.slug })}
                      >
                        <Edit3 size={12} /> Изменить
                      </button>
                      <button
                        className="btn text-xs"
                        onClick={() => {
                          if (
                            window.confirm(
                              `Удалить «${m.display_name}»? Связи в release_credits тоже удалятся.`,
                            )
                          ) {
                            void supabase
                              .from('members')
                              .delete()
                              .eq('slug', m.slug)
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

// ---------- форма ----------

function MemberForm({
  initial,
  isNew,
  onCancel,
  onSaved,
}: {
  initial: FormState
  isNew: boolean
  onCancel: () => void
  onSaved: () => void
}) {
  const [form, setForm] = useState<FormState>(initial)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Автогенерация slug при создании, пока пользователь не менял вручную.
  const [slugTouched, setSlugTouched] = useState(!isNew)
  useEffect(() => {
    if (!isNew || slugTouched) return
    setForm((f) => ({ ...f, slug: slugify(f.display_name) }))
  }, [form.display_name, isNew, slugTouched])

  const onPickAvatar = async (file: File) => {
    if (!form.slug) {
      setError('Сначала задай slug — файл сохранится в avatars/{slug}.{ext}')
      return
    }
    setUploading(true)
    setError(null)
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const path = `avatars/${form.slug}.${ext}`
    const { error: upErr } = await supabase.storage
      .from('media')
      .upload(path, file, { upsert: true, contentType: file.type })
    if (upErr) {
      setError('Не удалось загрузить аватар: ' + upErr.message)
    } else {
      setForm((f) => ({ ...f, avatar_path: path }))
    }
    setUploading(false)
  }

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!form.display_name.trim()) {
      setError('Имя обязательно')
      return
    }
    if (!form.slug.trim()) {
      setError('Slug обязателен')
      return
    }
    if (!isValidBirthDdMm(form.birth_mmdd)) {
      setError('Дата рождения должна быть в формате DD.MM')
      return
    }

    const tags = form.tagsText
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    const socials = {
      vk: form.socials.vk.trim() || undefined,
      telegram: form.socials.telegram.trim() || undefined,
      instagram: form.socials.instagram.trim() || undefined,
      youtube: form.socials.youtube.trim() || undefined,
    }

    const payload = {
      slug: form.slug.trim(),
      display_name: form.display_name.trim(),
      role: form.role.trim() || null,
      tags,
      birth_mmdd: form.birth_mmdd.trim() || null,
      bio: form.bio.trim() || null,
      avatar_path: form.avatar_path,
      socials,
      is_published: form.is_published,
      member_status: form.member_status, // <-- ДОБАВЛЕНО
    }

    setSaving(true)
    const { error } = await supabase.from('members').upsert(payload, {
      onConflict: 'slug',
    })
    setSaving(false)

    if (error) {
      setError(error.message)
      return
    }
    onSaved()
  }

  const avatar = publicUrl(form.avatar_path)

  return (
    <form onSubmit={onSave} className="grid gap-4 max-w-2xl">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl">
          {isNew ? 'Новый участник' : `Редактирование: ${form.display_name}`}
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
            Имя *
          </label>
          <input
            value={form.display_name}
            onChange={(e) => setForm({ ...form, display_name: e.target.value })}
            className="mt-2"
            required
          />
        </div>
        <div>
          <label className="text-[10px] tracking-[0.3em] uppercase text-muted">
            Slug *
          </label>
          <input
            value={form.slug}
            onChange={(e) => {
              setSlugTouched(true)
              setForm({ ...form, slug: e.target.value })
            }}
            className="mt-2 font-mono text-sm"
            placeholder="например, adam-grouse"
            required
          />
          <div className="text-xs text-muted mt-1">
            Латиница/кириллица, без пробелов. Используется в URL.
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] tracking-[0.3em] uppercase text-muted">
            Роль
          </label>
          <input
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="mt-2"
            placeholder="например, Вокалист"
          />
        </div>
        <div>
          <label className="text-[10px] tracking-[0.3em] uppercase text-muted">
            Дата рождения (DD.MM)
          </label>
          <input
            value={form.birth_mmdd}
            onChange={(e) => setForm({ ...form, birth_mmdd: e.target.value })}
            className="mt-2"
            placeholder="например, 14.02"
            maxLength={5}
          />
        </div>
      </div>

      <div>
        <label className="text-[10px] tracking-[0.3em] uppercase text-muted">
          Теги (через запятую)
        </label>
        <input
          value={form.tagsText}
          onChange={(e) => setForm({ ...form, tagsText: e.target.value })}
          className="mt-2"
          placeholder="вокалист, бэк-вокал"
        />
      </div>

      <div>
        <label className="text-[10px] tracking-[0.3em] uppercase text-muted">
          Био
        </label>
        <textarea
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
          className="mt-2 min-h-[100px]"
        />
      </div>

      <div className="surface-soft p-4">
        <label className="text-[10px] tracking-[0.3em] uppercase text-muted">
          Аватар
        </label>
        <div className="mt-2 flex items-center gap-4">
          {avatar ? (
            <img
              src={avatar}
              alt=""
              className="w-20 h-20 rounded-full object-cover bg-deep"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-deep flex items-center justify-center text-muted">
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
                  if (f) void onPickAvatar(f)
                }}
              />
            </label>
            {form.avatar_path && (
              <div className="text-xs text-muted mt-2 font-mono break-all">
                {form.avatar_path}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] tracking-[0.3em] uppercase text-muted">
            VK
          </label>
          <input
            value={form.socials.vk}
            onChange={(e) =>
              setForm({ ...form, socials: { ...form.socials, vk: e.target.value } })
            }
            className="mt-2"
            placeholder="https://vk.com/…"
          />
        </div>
        <div>
          <label className="text-[10px] tracking-[0.3em] uppercase text-muted">
            Telegram
          </label>
          <input
            value={form.socials.telegram}
            onChange={(e) =>
              setForm({
                ...form,
                socials: { ...form.socials, telegram: e.target.value },
              })
            }
            className="mt-2"
            placeholder="https://t.me/…"
          />
        </div>
        <div>
          <label className="text-[10px] tracking-[0.3em] uppercase text-muted">
            Instagram
          </label>
          <input
            value={form.socials.instagram}
            onChange={(e) =>
              setForm({
                ...form,
                socials: { ...form.socials, instagram: e.target.value },
              })
            }
            className="mt-2"
            placeholder="https://instagram.com/…"
          />
        </div>
        <div>
          <label className="text-[10px] tracking-[0.3em] uppercase text-muted">
            YouTube
          </label>
          <input
            value={form.socials.youtube}
            onChange={(e) =>
              setForm({
                ...form,
                socials: { ...form.socials, youtube: e.target.value },
              })
            }
            className="mt-2"
            placeholder="https://youtube.com/@…"
          />
        </div>
      </div>

      {/* НОВЫЙ БЛОК: Статус участника */}
      <div>
        <label className="text-[10px] tracking-[0.3em] uppercase text-muted">
          Статус участника
        </label>
        <select
          value={form.member_status}
          onChange={(e) => setForm({ ...form, member_status: e.target.value as 'active' | 'former' | 'hidden' })}
          className="mt-2"
        >
          <option value="active">Действующий участник</option>
          <option value="former">Бывший участник</option>
          <option value="hidden">Скрыт (не показывается нигде)</option>
        </select>
        <div className="text-xs text-muted mt-1">
          {form.member_status === 'active' && 'Показывается в основном составе'}
          {form.member_status === 'former' && 'Показывается в секции "Бывшие участники"'}
          {form.member_status === 'hidden' && 'Не показывается на сайте'}
        </div>
      </div>

      {/* Старый чекбокс оставляем как есть ниже */}
      <label className="flex items-center gap-2 text-sm mt-4">
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
    </form>
  )
}