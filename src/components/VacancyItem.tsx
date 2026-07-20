import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { Vacancy } from '../types'

interface Props {
  vacancy: Vacancy
  index?: number
}

export default function VacancyItem({ vacancy, index = 0 }: Props) {
  const [open, setOpen] = useState(index === 0)
  return (
    <div
      className="surface overflow-hidden reveal"
      style={{ animationDelay: `${index * 0.06}s` }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 p-6 text-left"
      >
        <div>
          <div className="text-[10px] tracking-[0.3em] uppercase text-accent mb-1">
            {vacancy.isOpen ? 'Открытая вакансия' : 'Закрыто'}
          </div>
          <h3 className="font-display text-2xl leading-tight">{vacancy.role}</h3>
        </div>
        <div
          className={`w-10 h-10 rounded-full bg-fireSoft flex items-center justify-center text-accent transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        >
          <ChevronDown size={18} />
        </div>
      </button>
      <div
        className={`grid transition-all duration-500 ease-out ${
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-6 pb-6 border-t border-border pt-5">
            <div className="text-[10px] tracking-[0.3em] uppercase text-muted mb-3">
              Требования
            </div>
            <ul className="grid gap-2 text-sm">
              {vacancy.requirements.map((r) => (
                <li key={r} className="flex items-start gap-2.5">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-fire shrink-0" />
                  {r}
                </li>
              ))}
            </ul>
            <div className="mt-5 surface-soft p-4 text-sm whitespace-pre-line">
              <div className="text-[10px] tracking-[0.3em] uppercase text-muted mb-1">
                Условия
              </div>
              {vacancy.conditions}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
