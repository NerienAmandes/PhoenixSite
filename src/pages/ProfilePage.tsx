import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { User as UserIcon, Sparkles, Construction, FileText } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function ProfilePage() {
  useDocumentTitle('Личный кабинет')

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      <div className="reveal reveal-1">
        <span className="tag"><UserIcon size={12} /> Личный кабинет</span>
      </div>
      <h1 className="reveal reveal-2 mt-4 font-display text-5xl sm:text-7xl leading-[1.2]">
        Скоро <span className="text-fire">здесь</span>
      </h1>
      <p className="reveal reveal-3 mt-5 text-lg text-muted max-w-xl">
        Личный кабинет с историей заявок и избранными треками пока в
        разработке. А пока — все заявки приходят к нам в Telegram сразу после
        отправки.
      </p>

      <div className="reveal reveal-4 mt-10 surface p-6 sm:p-8 flex items-start gap-5">
        <div className="w-12 h-12 shrink-0 rounded-2xl bg-fire flex items-center justify-center text-white shadow-glow">
          <Construction size={20} />
        </div>
        <div>
          <h2 className="font-display text-2xl">Раздел в разработке</h2>
          <p className="mt-2 text-base text-muted">
            Мы не запрашиваем регистрацию и не просим логиниться, чтобы
            оставить заявку. Просто заполните форму — и мы свяжемся с вами.
          </p>
        </div>
      </div>

      <div className="reveal reveal-5 mt-4 grid gap-4 sm:grid-cols-2">
        <Link
          to="/services"
          className="surface p-6 group hover:border-accent transition-colors"
        >
          <div className="w-10 h-10 rounded-2xl bg-fireSoft flex items-center justify-center text-accent">
            <Sparkles size={18} />
          </div>
          <h3 className="font-display text-xl mt-4">Заказать адаптацию</h3>
          <p className="text-sm text-muted mt-1">
            Переведём и адаптируем трек на русский язык.
          </p>
        </Link>
        <Link
          to="/join"
          className="surface p-6 group hover:border-accent transition-colors"
        >
          <div className="w-10 h-10 rounded-2xl bg-fireSoft flex items-center justify-center text-accent">
            <FileText size={18} />
          </div>
          <h3 className="font-display text-xl mt-4">Откликнуться на вакансию</h3>
          <p className="text-sm text-muted mt-1">
            Ищем вокалистов, звукарей, художников и других.
          </p>
        </Link>
      </div>
    </div>
  )
}
