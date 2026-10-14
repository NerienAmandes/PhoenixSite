import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { ChevronDown, ChevronUp, Loader2, Plus, Save, Trash2 } from 'lucide-react'

/* ---------- Конфигурации таблиц ---------- */

type FieldType = 'text' | 'textarea' | 'number' | 'boolean' | 'lines'

interface FieldDef {
  key: string
  label: string
  type: FieldType
  immutable?: boolean // первичный ключ — нельзя менять после создания
}

interface EntityConfig {
  table: string
  title: string
  hint?: string
  pkType: 'text' | 'uuid'
  idKey: string
  fields: FieldDef[]
}

const CONFIGS: EntityConfig[] = [
  {
    table: 'cover_stages',
    title: 'Этапы кавера',
    hint: 'Цены и описания этапов на странице «Кавер под ключ».',
    pkType: 'text',
    idKey: 'id',
    fields: [
      { key: 'id', label: 'ID (slug, латиницей)', type: 'text', immutable: true },
      { key: 'title', label: 'Название', type: 'text' },
      { key: 'description', label: 'Описание', type: 'textarea' },
      { key: 'base_price', label: 'Базовая цена, ₽', type: 'number' },
      { key: 'sort_order', label: 'Порядок (10, 20, 30…)', type: 'number' },
      { key: 'is_published', label: 'Показывать на сайте', type: 'boolean' },
    ],
  },
  {
    table: 'adaptation_prices',
    title: 'Цены адаптации',
    hint: 'Таблица стоимости на странице «Адаптация текстов».',
    pkType: 'text',
    idKey: 'id',
    fields: [
      { key: 'id', label: 'ID (slug)', type: 'text', immutable: true },
      { key: 'size', label: 'Размер (TV-size и т.д.)', type: 'text' },
      { key: 'duration', label: 'Длительность', type: 'text' },
      { key: 'price', label: 'Стандартная цена', type: 'text' },
      { key: 'japanese_price', label: 'Цена для японского', type: 'text' },
      { key: 'sort_order', label: 'Порядок', type: 'number' },
    ],
  },
  {
    table: 'price_factors',
    title: 'Факторы цены',
    pkType: 'uuid',
    idKey: 'id',
    fields: [
      { key: 'title', label: 'Заголовок', type: 'text' },
      { key: 'content', label: 'Текст', type: 'textarea' },
      { key: 'sort_order', label: 'Порядок', type: 'number' },
    ],
  },
  {
    table: 'work_conditions',
    title: 'Условия работы',
    pkType: 'uuid',
    idKey: 'id',
    fields: [
      { key: 'title', label: 'Заголовок', type: 'text' },
      { key: 'content', label: 'Текст', type: 'textarea' },
      { key: 'sort_order', label: 'Порядок', type: 'number' },
    ],
  },
  {
    table: 'services',
    title: 'Пакеты услуг',
    hint: 'Карточки пакетов на странице «Адаптация текстов».',
    pkType: 'text',
    idKey: 'slug',
    fields: [
      { key: 'slug', label: 'Slug (латиницей)', type: 'text', immutable: true },
      { key: 'title', label: 'Название', type: 'text' },
      { key: 'description', label: 'Описание', type: 'textarea' },
      { key: 'includes', label: 'Что входит (по пункту на строку)', type: 'lines' },
      { key: 'price', label: 'Цена (текстом, напр. «от 500 ₽»)', type: 'text' },
      { key: 'turnaround', label: 'Срок', type: 'text' },
      { key: 'sort_order', label: 'Порядок', type: 'number' },
      { key: 'is_published', label: 'Показывать на сайте', type: 'boolean' },
    ],
  },
  {
    table: 'vacancies',
    title: 'Вакансии',
    pkType: 'text',
    idKey: 'slug',
    fields: [
      { key: 'slug', label: 'Slug (латиницей)', type: 'text', immutable: true },
      { key: 'role', label: 'Название роли', type: 'text' },
      { key: 'requirements', label: 'Требования (по пункту на строку)', type: 'lines' },
      { key: 'conditions', label: 'Условия', type: 'textarea' },
      { key: 'sort_order', label: 'Порядок', type: 'number' },
      { key: 'is_open', label: 'Вакансия открыта', type: 'boolean' },
    ],
  },
]

/* ---------- Преобразование значений ---------- */

function toForm(config: EntityConfig, row: Record<string, any>): Record<string, any> {
  const values: Record<string, any> = {}
  for (const f of config.fields) {
    const raw = row[f.key]
    if (f.type === 'lines') values[f.key] = Array.isArray(raw) ? raw.join('\n') : ''
    else if (f.type === 'number') values[f.key] = raw ?? 0
    else if (f.type === 'boolean') values[f.key] = Boolean(raw)
    else values[f.key] = raw ?? ''
  }
  return values
}

function emptyForm(config: EntityConfig): Record<string, any> {
  const values: Record<string, any> = {}
  for (const f of config.fields) {
    if (f.type === 'lines') values[f.key] = ''
    else if (f.type === 'number') values[f.key] = 0
    else if (f.type === 'boolean') values[f.key] = true
    else values[f.key] = ''
  }
  return values
}

function toPayload(
  config: EntityConfig,
  values: Record<string, any>,
  isNew: boolean,
): Record<string, any> {
  const payload: Record<string, any> = {}
  for (const f of config.fields) {
    if (!isNew && f.immutable) continue
    if (f.type === 'lines')
      payload[f.key] = String(values[f.key] ?? '')
        .split('\n')
        .map((s: string) => s.trim())
        .filter(Boolean)
    else if (f.type === 'number') payload[f.key] = Number(values[f.key]) || 0
    else if (f.type === 'boolean') payload[f.key] = Boolean(values[f.key])
    else payload[f.key] = String(values[f.key] ?? '')
  }
  return payload
}

/* ---------- Поле ввода ---------- */

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: FieldDef
  value: any
  onChange: (v: any) => void
}) {
  const disabled = Boolean(field.immutable)
  if (field.type === 'boolean') {
    return (
      <label className="flex items-center gap-2 text-sm cursor-pointer py-2">
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
          className="accent-fire w-4 h-4"
        />
        {field.label}
      </label>
    )
  }
  if (field.type === 'textarea' || field.type === 'lines') {
    return (
      <label className="block text-sm">
        <span className="text-muted">{field.label}</span>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1 w-full text-base"
          rows={field.type === 'lines' ? 4 : 3}
          disabled={disabled}
        />
      </label>
    )
  }
  if (field.type === 'number') {
    return (
      <label className="block text-sm">
        <span className="text-muted">{field.label}</span>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="mt-1 w-full text-base"
          disabled={disabled}
        />
      </label>
    )
  }
  return (
    <label className="block text-sm">
      <span className="text-muted">{field.label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full text-base"
        disabled={disabled}
      />
    </label>
  )
}

/* ---------- Карточка существующей записи ---------- */

function RowCard({
  config,
  row,
  onChanged,
}: {
  config: EntityConfig
  row: Record<string, any>
  onChanged: () => void
}) {
  const [open, setOpen] = useState(false)
  const [values, setValues] = useState(() => toForm(config, row))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = (key: string, v: any) => setValues((p) => ({ ...p, [key]: v }))

  const save = async () => {
    setSaving(true)
    setError(null)
    const payload = toPayload(config, values, false)
    const { error: err } = await supabase
      .from(config.table)
      .update(payload)
      .eq(config.idKey, row[config.idKey])
    setSaving(false)
    if (err) setError(err.message)
    else onChanged()
  }

  const remove = async () => {
    if (!window.confirm('Удалить запись безвозвратно?')) return
    const { error: err } = await supabase
      .from(config.table)
      .delete()
      .eq(config.idKey, row[config.idKey])
    if (err) setError(err.message)
    else onChanged()
  }

  const title = row.title || row.role || row.size || String(row[config.idKey])

  return (
    <div className="surface border border-border/50 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 text-left flex-1 text-muted hover:text-ink transition-colors"
        >
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          <span className="font-medium text-ink">{title}</span>
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={save}
            disabled={saving}
            className="btn btn-ghost text-xs px-3 py-1.5 disabled:opacity-50"
          >
            {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
            Сохранить
          </button>
          <button
            onClick={remove}
            className="btn btn-ghost text-xs px-3 py-1.5 text-red-400 hover:bg-red-500/10"
            aria-label="Удалить"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
      {open && (
        <div className="px-4 pb-4 grid gap-3 sm:grid-cols-2">
          {config.fields.map((f) => (
            <div
              key={f.key}
              className={f.type === 'textarea' || f.type === 'lines' ? 'sm:col-span-2' : ''}
            >
              <FieldInput field={f} value={values[f.key]} onChange={(v) => set(f.key, v)} />
            </div>
          ))}
          {error && <div className="sm:col-span-2 text-sm text-red-400">{error}</div>}
        </div>
      )}
    </div>
  )
}

/* ---------- Карточка новой записи ---------- */

function NewCard({
  config,
  onCreated,
  onCancel,
}: {
  config: EntityConfig
  onCreated: () => void
  onCancel: () => void
}) {
  const [values, setValues] = useState(() => emptyForm(config))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = (key: string, v: any) => setValues((p) => ({ ...p, [key]: v }))

  const save = async () => {
    if (config.pkType === 'text' && !String(values[config.idKey] ?? '').trim()) {
      setError('Заполни ID (slug) латиницей, без пробелов')
      return
    }
    setSaving(true)
    setError(null)
    const payload = toPayload(config, values, true)
    const { error: err } = await supabase.from(config.table).insert(payload)
    setSaving(false)
    if (err) setError(err.message)
    else onCreated()
  }

  return (
    <div className="surface border border-fire/40 rounded-xl p-4 grid gap-3 sm:grid-cols-2">
      {config.fields.map((f) => (
        <div
          key={f.key}
          className={f.type === 'textarea' || f.type === 'lines' ? 'sm:col-span-2' : ''}
        >
          <FieldInput field={f} value={values[f.key]} onChange={(v) => set(f.key, v)} />
        </div>
      ))}
      {error && <div className="sm:col-span-2 text-sm text-red-400">{error}</div>}
      <div className="sm:col-span-2 flex items-center gap-2">
        <button onClick={save} disabled={saving} className="btn btn-primary text-sm disabled:opacity-50">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          Создать
        </button>
        <button onClick={onCancel} className="btn btn-ghost text-sm">
          Отмена
        </button>
      </div>
    </div>
  )
}

/* ---------- Секция таблицы ---------- */

function EntitySection({ config, defaultOpen = false }: { config: EntityConfig; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  const [rows, setRows] = useState<Record<string, any>[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from(config.table)
      .select('*')
      .order('sort_order', { ascending: true })
    setRows(data ?? [])
    setLoading(false)
  }, [config.table])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <section className="surface rounded-2xl border border-border/50 overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <div>
          <div className="font-display text-2xl">{config.title}</div>
          {config.hint && <div className="text-sm text-muted mt-0.5">{config.hint}</div>}
        </div>
        {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
      {open && (
        <div className="px-5 pb-5 grid gap-3">
          {loading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="animate-spin text-fire" size={28} />
            </div>
          ) : (
            rows.map((row) => (
              <RowCard
                key={String(row[config.idKey])}
                config={config}
                row={row}
                onChanged={load}
              />
            ))
          )}
          {adding ? (
            <NewCard
              config={config}
              onCreated={() => {
                setAdding(false)
                load()
              }}
              onCancel={() => setAdding(false)}
            />
          ) : (
            <button onClick={() => setAdding(true)} className="btn btn-ghost self-start text-sm">
              <Plus size={14} /> Добавить
            </button>
          )}
        </div>
      )}
    </section>
  )
}

/* ---------- Страница ---------- */

export default function AdminContentPage() {
  useDocumentTitle('Админка · Контент')
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-display text-4xl sm:text-5xl">Управление контентом</h1>
      <p className="mt-3 text-muted max-w-2xl">
        Цены, этапы, пакеты услуг, вакансии и условия — всё, что раньше было зашито
        в коде. Изменения появляются на сайте сразу после «Сохранить».
      </p>
      <div className="mt-8 grid gap-4">
        {CONFIGS.map((c, i) => (
          <EntitySection key={c.table} config={c} defaultOpen={i === 0} />
        ))}
      </div>
    </div>
  )
}