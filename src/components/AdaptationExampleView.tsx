import { useState } from 'react'
import { ArrowRight, Quote, Music2, Sparkles, Repeat } from 'lucide-react'
import type {
  AdaptationExample,
  AdaptationLine,
  AdaptationVerse,
} from '../types'
import { adaptations } from '../data/adaptations'

/** Цвет / иконка для типа акцента в строке адаптации. */
const HIGHLIGHT_META: Record<
  NonNullable<AdaptationLine['highlight']>,
  { label: string; tone: string; icon: typeof Sparkles }
> = {
  rhyme: { label: 'Рифма', tone: 'text-fire', icon: Repeat },
  rhythm: { label: 'Ритм', tone: 'text-warm', icon: Music2 },
  meaning: { label: 'Смысл', tone: 'text-accent', icon: Quote },
  image: { label: 'Образ', tone: 'text-fire', icon: Sparkles },
}

interface Props {
  /** Если не передано — берём все примеры из data/adaptations. */
  examples?: AdaptationExample[]
}

/**
 * Двухколоночный блок «оригинал ↔ адаптация».
 * Сверху — переключатель между примерами (табы).
 * Внутри — несколько подписанных фрагментов (verse), в каждом параллельные строки.
 * У строк с highlight справа показывается маленькая иконка-чип,
 * а note (если есть) — курсивной строкой под адаптацией.
 */
export default function AdaptationExampleView({ examples = adaptations }: Props) {
  const [activeId, setActiveId] = useState<string>(
    examples[0]?.id ?? ''
  )
  const active = examples.find((a) => a.id === activeId)

  if (!active) return null

  return (
    <div className="surface overflow-hidden">
      {/* Переключатель треков */}
      {examples.length > 1 && (
        <div className="px-5 sm:px-6 pt-5 sm:pt-6">
          <div className="surface-soft p-1.5 inline-flex flex-wrap gap-1 max-w-full">
            {examples.map((a) => {
              const isActive = a.id === activeId
              return (
                <button
                  key={a.id}
                  onClick={() => setActiveId(a.id)}
                  className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm tracking-wide transition-all ${
                    isActive
                      ? 'bg-fire text-white shadow-glow'
                      : 'text-muted hover:text-ink'
                  }`}
                >
                  {a.title}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Шапка: название + оригинал + тизер */}
      <div className="px-5 sm:px-7 pt-5 sm:pt-7 pb-2">
        <div className="text-[10px] sm:text-xs tracking-[0.3em] uppercase text-accent">
          {active.originalLang}
          {active.year ? ` · ${active.year}` : ''}
        </div>
        <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h3 className="font-display text-3xl sm:text-4xl leading-tight">
            {active.title}
          </h3>
          <span className="text-muted text-sm">
            оригинал: {active.originalArtist}
          </span>
        </div>
        <p className="mt-3 text-base text-muted max-w-2xl leading-relaxed">
          {active.teaser}
        </p>
      </div>

      {/* Колонки-подписи */}
      <div className="px-5 sm:px-7 pt-4">
        <div className="hidden sm:grid grid-cols-2 gap-5 pb-2 border-b border-border text-[10px] tracking-[0.3em] uppercase text-muted">
          <div>Оригинал</div>
          <div className="flex items-center gap-2">
            <span>Адаптация</span>
            <ArrowRight size={12} className="text-fire" />
          </div>
        </div>
      </div>

      {/* Стихи / строфы */}
      <div className="px-5 sm:px-7 pb-6 sm:pb-8 pt-3 sm:pt-4">
        {active.verses.map((verse, vi) => (
          <VerseBlock key={`${active.id}-${vi}`} verse={verse} />
        ))}
      </div>
    </div>
  )
}

function VerseBlock({ verse }: { verse: AdaptationVerse }) {
  return (
    <div className="py-4 sm:py-5 border-b border-border last:border-b-0">
      <div className="text-[10px] tracking-[0.3em] uppercase text-accent mb-3 sm:mb-4">
        {verse.label}
      </div>

      <ul className="grid gap-3 sm:gap-4">
        {verse.lines.map((line, i) => (
          <LineRow key={i} line={line} />
        ))}
      </ul>
    </div>
  )
}

function LineRow({ line }: { line: AdaptationLine }) {
  const meta = line.highlight ? HIGHLIGHT_META[line.highlight] : null
  const Icon = meta?.icon ?? null
  // Заглушка: «…» — означает, что пример ещё не заполнен.
  const isStub = line.original.trim() === '…' || line.adapted.trim() === '…'

  return (
    <li className="grid sm:grid-cols-2 gap-x-5 gap-y-2 sm:gap-y-1 group/line">
      {/* Оригинал */}
      <div className="text-muted text-base sm:text-lg leading-relaxed italic">
        {line.original}
      </div>

      {/* Адаптация + опциональный акцент и подпись */}
      <div className="relative">
        <div
          className={`text-base sm:text-lg leading-relaxed ${
            isStub
              ? 'text-muted italic opacity-60'
              : meta
                ? 'text-ink font-medium'
                : 'text-ink'
          }`}
        >
          {line.adapted}
        </div>

        {!isStub && meta && Icon && (
          <div className="mt-1 flex items-center gap-1.5 text-[10px] tracking-[0.2em] uppercase">
            <span className={`inline-flex items-center gap-1 ${meta.tone}`}>
              <Icon size={11} />
              {meta.label}
            </span>
            {line.note && (
              <span className="text-muted normal-case tracking-normal text-xs">
                — {line.note}
              </span>
            )}
          </div>
        )}

        {isStub && (
          <div className="mt-1 text-[10px] tracking-[0.2em] uppercase text-muted">
            Скоро появится
          </div>
        )}
      </div>
    </li>
  )
}
