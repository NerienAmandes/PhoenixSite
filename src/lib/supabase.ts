import { createClient } from '@supabase/supabase-js'

/**
 * Браузерный Supabase-клиент с anon-ключом.
 * Используется ТОЛЬКО для публичных SELECT и для Auth админки.
 *
 * Безопасность:
 *   - anon-ключ не даёт прав на INSERT/UPDATE/DELETE в публичных таблицах —
 *     это обеспечивают RLS-политики.
 *   - В браузер не утекает service_role (он только в server-окружении
 *     и используется seed-скриптом через `node:https`).
 */

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  throw new Error(
    'VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY должны быть определены в .env.local',
  )
}

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    storageKey: 'fp_admin_session',
  },
})

/**
 * Получить публичный URL объекта в Storage bucket `media`.
 * Например: publicUrl('avatars/adam-grouse.jpg') → 'https://…/avatars/adam-grouse.jpg'
 */
export function publicUrl(path: string | null | undefined): string | null {
  if (!path) return null
  const { data } = supabase.storage.from('media').getPublicUrl(path)
  // Добавляем timestamp, чтобы сбросить кэш браузера
  const url = data.publicUrl
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}t=${Date.now()}`
}