import { useEffect, useMemo, useState } from 'react'
import { ChevronDown, Filter, X } from 'lucide-react'
import type { Release } from '../types'

type Props = {
  releases: Release[]
  /** Слаг'и участников, доступных для фильтра (из `members` на странице /team). */
  members: { slug: string; name: string }[]
  /** Колбэк с отфильтрованным списком. */
  onFiltered: (list: Release[]) => void
}

/**
 * Панель фильтров для страницы «Релизы».
 *
 * Фильтрует:
 *   - по языку оригинала (multi-select)
 *   - по участникам релиза (multi-select, slug'и из credits)
 *
 * Логика: AND между группами, OR внутри группы.
 * «Все релизы с русским языком И хотя бы одного из выбранных участников».
 *
 * Сами фильтры — локальный state. Наружу прокидывает отфильтрованный список.
 */
export default function ReleaseFilters({ releases, members, onFiltered }: Props) {
  const [languages, setLanguages] = useState<string[]>([])
  const [memberSlugs, setMemberSlugs] = useState<string[]>([])
  const [openLang, setOpenLang] = useState(false)
  const [openMembers, setOpenMembers] = useState(false)

  // Уникальные языки из всех релизов.
  const allLanguages = useMemo(() => {
    const set = new Set<string>()
    for (const r of releases) {
      if (r.originalLanguage) set.add(r.originalLanguage)
    }
    return Array.from(set).sort()
  }, [releases])

  // Уникальные участники, у которых есть хотя бы один релиз.
  const availableMembers = useMemo(() => {
    const slugsInReleases = new Set<string>()
    for (const r of releases) {
      for (const s of r.credits ?? []) slugsInReleases.add(s)
    }
    return members.filter((m) => slugsInReleases.has(m.slug))
  }, [releases, members])

  // Применяем фильтры и прокидываем наружу. useEffect, а не useMemo,
  // потому что побочный эффект — вызов колбэка.
  useEffect(() => {
    const filtered = releases.filter((r) => {
      if (languages.length > 0 && !languages.includes(r.originalLanguage ?? '')) {
        return false
      }
      if (memberSlugs.length > 0) {
        const credits = r.credits ?? []
        if (!memberSlugs.some((s) => credits.includes(s))) return false
      }
      return true
    })
    onFiltered(filtered)
  }, [releases, languages, memberSlugs, onFiltered])

  const toggle = (list: string[], value: string): string[] =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value]

  const reset = () => {
    setLanguages([])
    setMemberSlugs([])
  }

  const hasFilters = languages.length > 0 || memberSlugs.length > 0

  // Если фильтровать нечего (нет ни языков, ни привязки к участникам) — скрываем.
  if (allLanguages.length === 0 && availableMembers.length === 0) {
    return null
  }

  const langLabel =
    languages.length === 0
      ? 'Все языки'
      : languages.length === 1
        ? languages[0]
        : `Языки: ${languages.length}`
  const memLabel =
    memberSlugs.length === 0
      ? 'Все участники'
      : memberSlugs.length === 1
        ? (members.find((m) => m.slug === memberSlugs[0])?.name ?? memberSlugs[0])
        : `Участники: ${memberSlugs.length}`

  return (
    <div className="mt-8 surface p-3 sm:p-4 flex flex-wrap items-center gap-2 sm:gap-3">
      <div className="flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase text-muted pr-1">
        <Filter size={12} /> Фильтры
      </div>

      {/* Языки */}
      {allLanguages.length > 0 && (
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setOpenLang((v) => !v)
              setOpenMembers(false)
            }}
            className={`btn text-xs sm:text-sm ${languages.length > 0 ? 'btn-primary' : ''}`}
          >
            {langLabel}
            <ChevronDown
              size={14}
              className={`transition-transform ${openLang ? 'rotate-180' : ''}`}
            />
          </button>
          {openLang && (
            <div
              className="absolute left-0 top-full mt-2 z-30 surface p-2 min-w-[200px] max-h-72 overflow-y-auto"
              onMouseLeave={() => setOpenLang(false)}
            >
              {allLanguages.map((lang) => {
                const checked = languages.includes(lang)
                return (
                  <label
                    key={lang}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-fireSoft cursor-pointer text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => setLanguages(toggle(languages, lang))}
                    />
                    <span>{lang}</span>
                  </label>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Участники */}
      {availableMembers.length > 0 && (
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setOpenMembers((v) => !v)
              setOpenLang(false)
            }}
            className={`btn text-xs sm:text-sm ${memberSlugs.length > 0 ? 'btn-primary' : ''}`}
          >
            {memLabel}
            <ChevronDown
              size={14}
              className={`transition-transform ${openMembers ? 'rotate-180' : ''}`}
            />
          </button>
          {openMembers && (
            <div
              className="absolute left-0 top-full mt-2 z-30 surface p-2 min-w-[240px] max-h-72 overflow-y-auto"
              onMouseLeave={() => setOpenMembers(false)}
            >
              {availableMembers.map((m) => {
                const checked = memberSlugs.includes(m.slug)
                return (
                  <label
                    key={m.slug}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-fireSoft cursor-pointer text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => setMemberSlugs(toggle(memberSlugs, m.slug))}
                    />
                    <span>{m.name}</span>
                  </label>
                )
              })}
            </div>
          )}
        </div>
      )}

      {hasFilters && (
        <button
          type="button"
          onClick={reset}
          className="btn text-xs sm:text-sm"
          title="Сбросить фильтры"
        >
          <X size={14} /> Сбросить
        </button>
      )}
    </div>
  )
}