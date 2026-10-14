/**
 * Единое место для «идентичности» команды: дата основания и ссылки на соцсети.
 *
 * Если нужно поменять ссылку или дату — правь только этот файл.
 * Страницы (Footer, AboutPage, Services*) импортируют данные отсюда.
 *
 * Формат даты — ISO 8601 (`YYYY-MM-DD`), чтобы JS мог её распарсить в `Date`.
 * `TEAM_FOUNDED_LABEL` — для UI («30.12.2019»).
 */

/** День рождения команды: 30 декабря 2019. */
export const TEAM_FOUNDED_AT = '2019-12-30'

/** То же, в формате для UI. */
export const TEAM_FOUNDED_LABEL = '30.12.2019'

export type SocialId = 'youtube' | 'tiktok' | 'telegram' | 'boosty'

export type Social = {
  id: SocialId
  /** Название платформы для UI. */
  label: string
  /** Короткий хэндл, отображается рядом с иконкой (например, "@firephoenix6297"). */
  handle: string
  /** Полная ссылка. */
  href: string
  /** Короткое описание для крупных блоков (AboutPage). Необязательно. */
  description?: string
}

export const SOCIALS: Social[] = [
  {
    id: 'youtube',
    label: 'YouTube',
    handle: '@firephoenix6297',
    href: 'https://youtube.com/@firephoenix6297?si=-jOHXpqn3oIL4UQx',
    description: 'Каверы, Shorts, backstage',
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    handle: '@firephoenixteam11',
    href: 'http://tiktok.com/@firephoenixteam11',
    description: 'Короткие видео и вайбы',
  },
  {
    id: 'telegram',
    label: 'Telegram',
    handle: '@fire_PhoenixTeam',
    href: 'https://t.me/fire_PhoenixTeam',
    description: 'Новости и общение с командой',
  },
  {
    id: 'boosty',
    label: 'Boosty',
    handle: '@firephoenix_team',
    href: 'http://boosty.to/firephoenix_team',
    description: 'Поддержать нашу работу',
  },
]

/** Возвращает соцсеть по id или undefined, если такой нет. */
export function getSocial(id: SocialId): Social | undefined {
  return SOCIALS.find((s) => s.id === id)
}