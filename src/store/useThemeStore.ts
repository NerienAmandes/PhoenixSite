import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark'

interface ThemeState {
  theme: Theme
  toggle: () => void
  setTheme: (t: Theme) => void
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'dark',
      toggle: () => {
        set((state) => {
          const next: Theme = state.theme === 'dark' ? 'light' : 'dark'
          applyTheme(next)
          return { theme: next }
        })
      },
      setTheme: (t) => {
        applyTheme(t)
        set({ theme: t })
      },
    }),
    {
      name: 'fp_theme',
      onRehydrateStorage: () => (state) => {
        if (state) applyTheme(state.theme)
      },
    }
  )
)
