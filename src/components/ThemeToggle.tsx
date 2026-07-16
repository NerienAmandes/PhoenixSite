import { Sun, Moon } from 'lucide-react'
import { useThemeStore } from '../store/useThemeStore'

export default function ThemeToggle() {
  const { theme, toggle } = useThemeStore()
  const isDark = theme === 'dark'
  return (
    <button
      type="button"
      onClick={toggle}
      className="btn btn-icon btn-outline"
      aria-label={isDark ? 'Включить светлую тему' : 'Включить тёмную тему'}
      title={isDark ? 'Светлая тема' : 'Тёмная тема'}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}
