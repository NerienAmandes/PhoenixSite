import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '../types'

interface StoredUser extends User {
  password: string
}

interface AuthState {
  user: User | null
  users: StoredUser[]
  login: (email: string, password: string) => { ok: boolean; error?: string }
  register: (name: string, email: string, password: string) => { ok: boolean; error?: string }
  logout: () => void
  updateProfile: (patch: Partial<User>) => void
}

const USERS_KEY = 'fp_users'
const AUTH_KEY = 'fp_auth'

function readUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    return raw ? (JSON.parse(raw) as StoredUser[]) : []
  } catch {
    return []
  }
}

function writeUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      users: readUsers(),
      login: (email, password) => {
        const users = get().users
        const found = users.find(
          (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
        )
        if (!found) {
          return { ok: false, error: 'Неверный e-mail или пароль' }
        }
        const { password: _pwd, ...publicUser } = found
        set({ user: publicUser })
        return { ok: true }
      },
      register: (name, email, password) => {
        const users = get().users
        if (users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) {
          return { ok: false, error: 'Пользователь с таким e-mail уже существует' }
        }
        const newUser: StoredUser = {
          id: `u_${Date.now()}`,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          registeredAt: new Date().toISOString(),
        }
        const next = [...users, newUser]
        writeUsers(next)
        const { password: _pwd, ...publicUser } = newUser
        set({ users: next, user: publicUser })
        return { ok: true }
      },
      logout: () => set({ user: null }),
      updateProfile: (patch) => {
        const current = get().user
        if (!current) return
        const updated: User = { ...current, ...patch }
        set({ user: updated })
        const users = get().users.map((u) =>
          u.id === current.id ? { ...u, ...patch } : u
        )
        writeUsers(users)
        set({ users })
      },
    }),
    {
      name: AUTH_KEY,
      partialize: (state) => ({ user: state.user }),
    }
  )
)
