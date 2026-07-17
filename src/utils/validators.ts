export const isValidEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())

export const isValidPassword = (password: string): boolean => password.length >= 6

export const isValidName = (name: string): boolean => name.trim().length >= 2

export const isValidBirthDate = (value: string): boolean => {
  const match = value.trim().match(/^(\d{2})\.(\d{2})\.(\d{4})$/)
  if (!match) return false
  const day = Number(match[1])
  const month = Number(match[2])
  const year = Number(match[3])
  if (month < 1 || month > 12) return false
  if (day < 1 || day > 31) return false
  const currentYear = new Date().getFullYear()
  if (year < 1900 || year > currentYear) return false
  const date = new Date(year, month - 1, day)
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  )
}
