import { create } from 'zustand'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'

export type AdminRole = 'owner' | 'editor'

interface AdminAuthState {
  /** Текущая Supabase-сессия (null = не залогинен). */
  session: Session | null
  /** Текущий пользователь Auth (если залогинен). */
  user: User | null
  /** Роль из public.admin_users. null = не админ. */
  role: AdminRole | null
  /** true пока идёт начальная загрузка / signIn. */
  loading: boolean
  /** Сообщение об ошибке последней операции (signIn). */
  error: string | null
  /** Удобные геттеры. */
  isAdmin: boolean
  isOwner: boolean
  /** Действия. */
  signIn: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>
  signOut: () => Promise<void>
  /** Внутренний: дёрнуть роль из БД по текущему user.id. */
  refreshRole: (userId: string | null) => Promise<void>
  /** Внутренний: применить новую сессию (от onAuthStateChange). */
  applySession: (session: Session | null) => Promise<void>
}

/**
 * Store для админки. Авторизация — через Supabase Auth (email/password).
 * Отделён от публичной зоны сайта: зрителям регистрация не нужна.
 */
export const useAdminAuth = create<AdminAuthState>((set, get) => ({
  session: null,
  user: null,
  role: null,
  loading: true,
  error: null,
  isAdmin: false,
  isOwner: false,

  applySession: async (session) => {
    if (!session) {
      set({
        session: null,
        user: null,
        role: null,
        isAdmin: false,
        isOwner: false,
      })
      return
    }
    set({ session, user: session.user })
    await get().refreshRole(session.user.id)
  },

  refreshRole: async (userId) => {
    if (!userId) {
      set({ role: null, isAdmin: false, isOwner: false })
      return
    }
    const { data, error } = await supabase
      .from('admin_users')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle()
    if (error) {
      // RLS не пускает (юзер не админ) или другая ошибка — трактуем как «не админ».
      set({ role: null, isAdmin: false, isOwner: false })
      return
    }
    const role = (data?.role ?? null) as AdminRole | null
    set({
      role,
      isAdmin: role === 'owner' || role === 'editor',
      isOwner: role === 'owner',
    })
  },

  signIn: async (email, password) => {
    set({ loading: true, error: null })
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    if (error || !data.session) {
      const msg =
        error?.message === 'Invalid login credentials'
          ? 'Неверный e-mail или пароль'
          : error?.message ?? 'Не удалось войти'
      set({ loading: false, error: msg })
      return { ok: false, error: msg }
    }
    await get().applySession(data.session)
    set({ loading: false })
    // Доп. проверка: даже если Auth прошёл, юзер может не быть в admin_users.
    if (!get().isAdmin) {
      await get().signOut()
      const msg = 'Аккаунт не имеет доступа к админке'
      set({ error: msg })
      return { ok: false, error: msg }
    }
    return { ok: true }
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({
      session: null,
      user: null,
      role: null,
      isAdmin: false,
      isOwner: false,
      error: null,
    })
  },
}))

/**
 * Один раз при загрузке приложения: подписываемся на изменения сессии.
 * Возвращает функцию отписки.
 */
export function initAdminAuth(): () => void {
  const { applySession } = useAdminAuth.getState()
  // Получаем текущую сессию сразу (Supabase восстановит из storageKey).
  supabase.auth.getSession().then(({ data }) => {
    applySession(data.session).finally(() => {
      useAdminAuth.setState({ loading: false })
    })
  })
  // Подписка на изменения (login/logout/token refresh).
  const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
    applySession(session)
  })
  return () => sub.subscription.unsubscribe()
}
