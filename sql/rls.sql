-- =====================================================================
-- RLS-политики для бота напоминаний о днях рождения FirePhoenix
-- =====================================================================
-- Применить в Supabase: SQL Editor → New query → вставить → Run
-- =====================================================================

-- Включаем RLS на таблицах (если ещё не включён)
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.release_subscribers ENABLE ROW LEVEL SECURITY;

-- --- members ---
-- Разрешаем чтение опубликованных участников всем (через anon-ключ)
DROP POLICY IF EXISTS "members_read_public" ON public.members;
CREATE POLICY "members_read_public"
  ON public.members
  FOR SELECT
  TO anon
  USING (is_published = true);

-- --- release_subscribers ---
-- Разрешаем вставку новых подписчиков (команда /start)
DROP POLICY IF EXISTS "subscribers_insert" ON public.release_subscribers;
CREATE POLICY "subscribers_insert"
  ON public.release_subscribers
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Разрешаем обновление подписчиков (команды /start-активация, /stop, last_notified)
DROP POLICY IF EXISTS "subscribers_update" ON public.release_subscribers;
CREATE POLICY "subscribers_update"
  ON public.release_subscribers
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Разрешаем чтение подписчиков (для рассылки напоминаний)
DROP POLICY IF EXISTS "subscribers_select" ON public.release_subscribers;
CREATE POLICY "subscribers_select"
  ON public.release_subscribers
  FOR SELECT
  TO anon
  USING (true);
