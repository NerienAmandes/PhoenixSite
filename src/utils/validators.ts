export const isValidEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())

export const isValidPassword = (password: string): boolean => password.length >= 6

export const isValidName = (name: string): boolean => name.trim().length >= 2
