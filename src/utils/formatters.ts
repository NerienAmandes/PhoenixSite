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
