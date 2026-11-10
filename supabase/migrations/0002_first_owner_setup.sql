-- =============================================================================
-- 0002_first_owner_setup.sql
-- FirePhoenix Team — назначение первого owner
--
-- ИНСТРУКЦИЯ:
--   1. Зарегистрируйте owner'а через Supabase Auth (Dashboard -> Authentication ->
--      Users -> Add user -> Create new user). Запишите его user_id (UUID).
--   2. Откройте этот файл и замените :OWNER_USER_ID и :OWNER_EMAIL на реальные
--      значения owner'а.
--   3. Запустите этот скрипт от роли postgres (или другой с правами на INSERT в
--      public.admin_users).
--
-- Проверки:
--   * Если пользователь с указанным user_id не существует в auth.users — скрипт
--     аварийно завершается (NOTICE + RAISE EXCEPTION).
--   * Если в public.admin_users уже есть owner — скрипт аварийно завершается.
--   * INSERT выполняется БЕЗ ON CONFLICT — если строка уже существует,
--     сработает unique constraint violation и операция будет отменена.
-- =============================================================================

do $$
declare
  target_user_id uuid := '93ab4445-429c-4b11-a31c-b4b663b4ff92'; -- UUID owner'а из auth.users
  target_email    text := 'valdrotgar@gmail.com';   -- email owner'а (для лога)
  existing_owners int;
begin
  -- Проверка 1: пользователь должен существовать в auth.users
  if not exists (select 1 from auth.users where id = target_user_id) then
    raise exception 'user % (%) not found in auth.users', target_email, target_user_id;
  end if;

  -- Проверка 2: не должно быть существующего owner'а
  select count(*) into existing_owners from public.admin_users where role = 'owner';
  if existing_owners > 0 then
    raise exception 'an owner already exists; this script is for the FIRST owner only';
  end if;

  -- INSERT без ON CONFLICT — unique constraint на user_id обеспечит идемпотентность.
  -- granted_by = NULL: первый owner не может выдать права самому себе.
  insert into public.admin_users (user_id, role, granted_by, granted_at)
  values (target_user_id, 'owner', NULL, now());

  raise notice 'owner % (%) added to admin_users', target_email, target_user_id;
end $$;

-- =============================================================================
-- Конец миграции
-- =============================================================================
