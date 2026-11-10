import { Pool } from 'pg'

/**
 * Пул соединений с PostgreSQL (Supabase).
 * Supabase требует SSL-соединение.
 */
const connectionString = process.env.SUPABASE_DATABASE_URL

if (!connectionString) {
  // Не бросаем ошибку при импорте, чтобы не ломать сборку фронтенда.
  // Ошибка возникнет только при попытке выполнить запрос.
  console.warn('[db] SUPABASE_DATABASE_URL не задана в окружении')
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  max: 10,
})

export default pool
