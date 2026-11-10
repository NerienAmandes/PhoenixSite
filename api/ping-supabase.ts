import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

/**
 * Cron endpoint: лёгкий пинг Supabase, чтобы проект не ушёл в pause
 * на free-тарифе (через 7 дней бездействия).
 *
 * Защищён Bearer-токеном из переменной окружения CRON_SECRET.
 * Срабатывает по расписанию из vercel.json -> crons.
 *
 * Если нет CRON_SECRET — endpoint работает только в dev (NODE_ENV !== 'production').
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const cronSecret = process.env.CRON_SECRET

  // В проде требуем секрет. В локали разрешаем без него для удобства отладки.
  if (process.env.NODE_ENV === 'production') {
    const auth = req.headers['authorization']
    if (!cronSecret || auth !== `Bearer ${cronSecret}`) {
      return res.status(401).json({ ok: false, error: 'Unauthorized' })
    }
  }

  const url = process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    return res.status(500).json({
      ok: false,
      error: 'SUPABASE_URL или SUPABASE_SERVICE_ROLE_KEY не заданы',
    })
  }

  // Минимальный запрос к существующей таблице (HEAD-style через PostgREST).
  // Не считаем строки — нам важно просто "задеть" БД, чтобы активность
  // была зафиксирована Supabase.
  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  try {
    const { error } = await supabase
      .from('releases')
      .select('id', { head: true, count: 'exact' })
      .limit(1)

    if (error) {
      return res.status(502).json({ ok: false, error: error.message })
    }

    return res.status(200).json({
      ok: true,
      pingedAt: new Date().toISOString(),
    })
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    })
  }
}