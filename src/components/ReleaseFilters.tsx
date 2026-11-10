import { useState } from 'react'
import { ChevronDown, ChevronUp, Filter, X } from 'lucide-react'

type Props = {
  members: { slug: string; name: string }[]
  selectedMembers: string[]
  onMemberChange: (slugs: string[]) => void
  selectedLang: string
  onLangChange: (lang: string) => void
}

const LANGUAGE_OPTIONS = [
  { label: 'Все', value: '' },
  { label: 'Японский', value: 'japanese' },
  { label: 'Корейский', value: 'korean' },
  { label: 'Английский', value: 'english' },
]

/**
 * Полностью контролируемый компонент: НЕ имеет своего состояния фильтров
 * и НЕ вызывает useEffect. Только рисует кнопки и дёргает колбэки родителя.
 * Это гарантированно убирает бесконечные циклы обновлений.
 */
export default function ReleaseFilters({
  members,
  selectedMembers,
  onMemberChange,
  selectedLang,
  onLangChange,
}: Props) {
  const [isExpanded, setIsExpanded] = useState(false)

  const activeCount = (selectedLang ? 1 : 0) + selectedMembers.length

  const reset = () => {
    onLangChange('')
    onMemberChange([])
  }

  const toggleMember = (slug: string) => {
    onMemberChange(
      selectedMembers.includes(slug)
        ? selectedMembers.filter((s) => s !== slug)
        : [...selectedMembers, slug],
    )
  }

  return (
    <div className="mt-8 mb-8 reveal">
      {/* Кнопка-заголовок: свернуть/развернуть */}
      <button
        onClick={() => setIsExpanded((prev) => !prev)}
        className="w-full surface p-4 sm:p-5 rounded-2xl border border-border/50 flex items-center justify-between hover:border-accent/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
              activeCount > 0 ? 'bg-fire text-white shadow-glow' : 'bg-fireSoft text-accent'
            }`}
          >
            <Filter size={18} />
          </div>
          <div className="text-left">
            <div className="text-sm font-medium text-ink">Фильтры релизов</div>
            {activeCount > 0 && (
              <div className="text-xs text-accent mt-0.5">Выбрано: {activeCount}</div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 text-muted">
          {activeCount > 0 && (
            <span
              onClick={(e) => {
                e.stopPropagation()
                reset()
              }}
              className="text-xs px-3 py-1.5 rounded-lg bg-surface-soft hover:bg-red-500/10 hover:text-red-400 transition-colors cursor-pointer flex items-center gap-1"
            >
              <X size={12} /> Сбросить
            </span>
          )}
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </button>

      {/* Раскрывающаяся панель */}
      <div
        className={`grid transition-all duration-300 ease-in-out overflow-hidden ${
          isExpanded ? 'grid-rows-[1fr] opacity-100 mt-3' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="surface p-5 sm:p-6 rounded-2xl border border-border/50 space-y-6">
            {/* Язык оригинала */}
            <div>
              <div className="text-[10px] sm:text-xs tracking-[0.3em] uppercase text-muted font-medium mb-3">
                Язык оригинала
              </div>
              <div className="flex flex-wrap gap-2">
                {LANGUAGE_OPTIONS.map((lang) => {
                  const isActive = selectedLang === lang.value
                  return (
                    <button
                      key={lang.value}
                      onClick={() => onLangChange(lang.value)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                        isActive
                          ? 'bg-fire text-white border-fire shadow-glow'
                          : 'bg-surface-soft text-muted border-transparent hover:bg-border hover:text-ink'
                      }`}
                    >
                      {lang.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Участники */}
            {members.length > 0 && (
              <div>
                <div className="text-[10px] sm:text-xs tracking-[0.3em] uppercase text-muted font-medium mb-3">
                  Участники
                </div>
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-2">
                  <button
                    onClick={() => onMemberChange([])}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                      selectedMembers.length === 0
                        ? 'bg-fire text-white border-fire shadow-glow'
                        : 'bg-surface-soft text-muted border-transparent hover:bg-border hover:text-ink'
                    }`}
                  >
                    Все
                  </button>
                  {members.map((m) => {
                    const isActive = selectedMembers.includes(m.slug)
                    return (
                      <button
                        key={m.slug}
                        onClick={() => toggleMember(m.slug)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border whitespace-nowrap ${
                          isActive
                            ? 'bg-fire text-white border-fire shadow-glow'
                            : 'bg-surface-soft text-muted border-transparent hover:bg-border hover:text-ink'
                        }`}
                      >
                        {m.name}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}