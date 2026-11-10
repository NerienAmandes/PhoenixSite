import { createClient } from '@supabase/supabase-js'

/**
 * Клиент Supabase (REST API).
 * Используется для чтения/записи в таблицы members и release_subscribers.
 *
 * Для работы с anon-ключом необходимо включить RLS на таблицах
 * и создать политики (см. sql/rls.sql).
 */
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.warn('[db] VITE_SUPABASE_URL или VITE_SUPABASE_ANON_KEY не заданы в окружении')
}

const supabase = createClient(supabaseUrl ?? '', supabaseKey ?? '', {
  auth: { persistSession: false },
})

export default supabase
