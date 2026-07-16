import type { Service } from '../types'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Check } from 'lucide-react'

interface Props {
  service: Service
  index?: number
}

export default function ServiceCard({ service, index = 0 }: Props) {
  return (
    <article
      className="surface relative overflow-hidden p-7 hover:-translate-y-1 transition-transform duration-300 reveal"
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      <div className="absolute -bottom-12 -right-12 w-44 h-44 rounded-full bg-fire opacity-20 blur-3xl" />
      <div className="text-[10px] tracking-[0.3em] uppercase text-accent mb-2">
        Пакет {String(index + 1).padStart(2, '0')}
      </div>
      <h3 className="font-display text-2xl leading-tight max-w-xs">
        {service.title}
      </h3>
      <p className="mt-3 text-sm text-muted leading-relaxed">
        {service.description}
      </p>
      <ul className="mt-5 grid gap-2.5 text-sm">
        {service.includes.map((item) => (
          <li key={item} className="flex items-start gap-2.5">
            <span className="mt-0.5 w-5 h-5 rounded-full bg-fireSoft flex items-center justify-center text-accent shrink-0">
              <Check size={12} strokeWidth={3} />
            </span>
            <span className="text-ink">{item}</span>
          </li>
        ))}
      </ul>
      <div className="mt-6 pt-5 border-t border-border flex items-end justify-between">
        <div>
          <div className="text-[10px] tracking-[0.3em] uppercase text-muted">Стоимость</div>
          <div className="font-display text-2xl text-fire">{service.price}</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] tracking-[0.3em] uppercase text-muted">Срок</div>
          <div className="text-sm">{service.turnaround}</div>
        </div>
      </div>
      <Link
        to="/services"
        className="mt-6 inline-flex items-center gap-1.5 text-xs tracking-[0.2em] uppercase text-accent hover:underline"
      >
        Оставить заявку <ArrowUpRight size={12} />
      </Link>
    </article>
  )
}
