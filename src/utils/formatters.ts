export const formatDate = (iso: string): string => {
  const d = new Date(iso)
  return d.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export const formatDateShort = (iso: string): string => {
  const d = new Date(iso)
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' })
}

/**
 * Форматирует число с неразрывным пробелом-разделителем тысяч
 * по русской локали: 352212 → "352 212".
 */
export const formatNumber = (n: number): string => {
  if (!Number.isFinite(n)) return '—'
  return n.toLocaleString('ru-RU').replace(/,/g, ' ')
}

/**
 * «Обновлено N сек/мин назад» — короткая подпись для подписей статистики.
 */
export const formatAge = (seconds: number | null): string => {
  if (seconds == null) return ''
  if (seconds < 5) return 'только что'
  if (seconds < 60) return `${seconds} сек назад`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} мин назад`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} ч назад`
  const days = Math.floor(hours / 24)
  return `${days} дн назад`
}

/**
 * Форматирует число дней до даты релиза в человекочитаемый ярлык:
 *   null — дата не указана или некорректна
 *   0 — «Сегодня»
 *   1 — «Завтра»
 *   2..4 — «Через N дня»
 *   5+   — «Через N дней»
 *   отрицательное — «Вышел» (дата прошла)
 *
 * Используется в карточках upcoming-релизов, чтобы дать эмоциональный
 * триггер ожидания. Считаем от «сейчас» до начала целевого дня по локали.
 */
export const formatCountdown = (
  iso: string | null | undefined,
  now: Date = new Date(),
): { text: string; tone: 'soon' | 'normal' | 'past' } | null => {
  if (!iso) return null
  const target = new Date(iso)
  if (Number.isNaN(target.getTime())) return null

  // Считаем разницу в полных календарных днях (по московскому времени).
  // Берём «начало суток» обеих дат, чтобы не сбиваться из-за часа.
  const strip = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const diffDays = Math.round((strip(target) - strip(now)) / 86_400_000)

  if (diffDays < 0) return { text: 'Вышел', tone: 'past' }
  if (diffDays === 0) return { text: 'Сегодня', tone: 'soon' }
  if (diffDays === 1) return { text: 'Завтра', tone: 'soon' }
  // 2..4 — «дня», +5 — «дней». 11..14 — особое склонение «дней».
  let word: string
  const mod10 = diffDays % 10
  const mod100 = diffDays % 100
  if (mod10 === 1 && mod100 !== 11) word = 'день'
  else if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) word = 'дня'
  else word = 'дней'
  return {
    text: `Через ${diffDays} ${word}`,
    tone: diffDays <= 7 ? 'soon' : 'normal',
  }
}
