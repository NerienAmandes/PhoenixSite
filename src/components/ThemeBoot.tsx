import { useEffect } from 'react'
import { useThemeStore } from '../store/useThemeStore'

export default function ThemeBoot() {
  const theme = useThemeStore((s) => s.theme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  return null
}
