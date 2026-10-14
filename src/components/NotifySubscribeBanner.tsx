import { Bell } from 'lucide-react'

type Props = {
  /** Telegram-username бота без @. Например: firephoenix_bot. */
  botUsername?: string
  /** Текст CTA. */
  cta?: string
  className?: string
}

/**
 * Баннер «Подписаться на новые релизы через Telegram-бот».
 *
 * Открывает deep-link `https://t.me/<bot>?start=subscribe` — пользователь
 * попадает в бота и жмёт /start (или бот сам ответит приветствием, т.к.
 * /start — стандартная команда Telegram).
 *
 * Username бота берётся из VITE_TELEGRAM_BOT_USERNAME; если не задан —
 * используется fallback. Поменять можно в .env / Vercel env.
 */
export default function NotifySubscribeBanner({
  botUsername,
  cta = 'Подписаться на новые релизы',
  className = '',
}: Props) {
  const username =
    botUsername ??
    (import.meta.env.VITE_TELEGRAM_BOT_USERNAME as string | undefined) ??
    'firephoenix_bot'
  const href = `https://t.me/${username}?start=subscriber`

  return (
    <div
      className={`surface relative overflow-hidden p-6 sm:p-8 flex flex-wrap items-center gap-4 sm:gap-6 ${className}`}
    >
      <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full bg-fire opacity-10 blur-3xl pointer-events-none" />
      <div className="relative w-12 h-12 rounded-2xl bg-fire flex items-center justify-center text-white shadow-glow shrink-0">
        <Bell size={20} />
      </div>
      <div className="relative flex-1 min-w-0">
        <div className="text-[10px] tracking-[0.3em] uppercase text-accent">
          Уведомления о релизах
        </div>
        <div className="mt-1 font-display text-xl sm:text-2xl leading-tight">
          Не пропусти новый кавер
        </div>
        <p className="mt-1 text-sm text-muted max-w-xl">
          Подпишись на нашего Telegram-бота — пришлём сообщение сразу после
          публикации.
        </p>
      </div>
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="btn btn-primary relative shrink-0"
      >
        {cta}
      </a>
    </div>
  )
}