import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface FavoritesState {
  favorites: string[]
  toggle: (id: string) => void
  has: (id: string) => boolean
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      toggle: (id) =>
        set((state) => ({
          favorites: state.favorites.includes(id)
            ? state.favorites.filter((f) => f !== id)
            : [...state.favorites, id],
        })),
      has: (id) => get().favorites.includes(id),
    }),
    { name: 'fp_favorites' }
  )
)
