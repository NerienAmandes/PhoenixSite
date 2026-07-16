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
