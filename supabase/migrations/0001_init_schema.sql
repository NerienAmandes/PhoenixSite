-- =============================================================================
-- 0001_init_schema.sql
-- FirePhoenix Team — начальная миграция схемы Supabase
--
-- Запускать от роли с правами owner на БД (обычно postgres).
-- Применяется один раз при первоначальной настройке проекта.
--
-- Структура миграции:
--   0. Закрытая схема private для служебных функций
--   1. Таблицы: members, releases, release_credits, admin_users
--   2. Partial unique index: только один owner
--   3. SECURITY DEFINER функции (is_admin, is_owner, admin_users_protect_owner)
--   4. Триггер защиты owner (advisory lock + FOR UPDATE)
--   5. Включение RLS
--   6. RLS-политики
--   7. GRANT/REVOKE синхронизация с RLS
--
-- ВАЖНО о порядке: функции и триггеры ссылаются на public.admin_users, поэтому
-- таблицы создаются ДО функций. Иначе CREATE FUNCTION упадёт с
-- "relation does not exist".
--
-- Примечание о пуле соединений (PgBouncer):
--   Supabase может использовать PgBouncer в режиме transaction.
--   SECURITY DEFINER функции используют set search_path = pg_catalog
--   и читают только из public.admin_users — это безопасно в любом режиме пула.
-- =============================================================================

-- =============================================================================
-- 0. Закрытая схема private для служебных функций
-- =============================================================================
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

-- =============================================================================
-- 1. Таблицы
-- =============================================================================

-- 1.1 members — участники команды
create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  display_name text not null,
  role text,
  tags text[] not null default '{}',
  birth_mmdd text,
  bio text,
  avatar_path text,
  socials jsonb not null default '{}'::jsonb,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 1.2 releases — релизы
create table if not exists public.releases (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  original_artist text,
  cover_url text,
  release_date date,
  status text not null default 'upcoming' check (status in ('upcoming', 'released')),
  platforms jsonb not null default '{}'::jsonb,
  description text,
  current_stage smallint not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 1.3 release_credits — связь many-to-many релиз <-> участник
create table if not exists public.release_credits (
  release_id uuid not null references public.releases(id) on delete cascade,
  member_id uuid not null references public.members(id) on delete restrict,
  role_label text,
  primary key (release_id, member_id)
);

create index if not exists release_credits_member_id_idx
  on public.release_credits (member_id);

-- 1.4 admin_users — привязка auth.users к ролям owner/editor
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'editor')),
  granted_by uuid references auth.users(id) on delete set null,
  granted_at timestamptz not null default now()
);

-- =============================================================================
-- 2. Partial unique index: только один owner в системе
-- =============================================================================
create unique index if not exists admin_users_only_one_owner
  on public.admin_users ((true))
  where role = 'owner';

-- =============================================================================
-- 3. Функции проверки прав (SECURITY DEFINER в закрытой схеме)
-- =============================================================================

-- is_admin: true если текущий пользователь — owner или editor
create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = pg_catalog
as $$
  -- auth.uid() is not null: defense-in-depth против анонимных вызовов
  select auth.uid() is not null
    and exists (
      select 1
      from public.admin_users au
      where au.user_id = auth.uid()
        and au.role in ('owner', 'editor')
    );
$$;

revoke all on function private.is_admin() from public, anon, authenticated;
grant execute on function private.is_admin() to anon, authenticated;

-- is_owner: true если текущий пользователь — owner
create or replace function private.is_owner()
returns boolean
language sql
stable
security definer
set search_path = pg_catalog
as $$
  -- auth.uid() is not null: defense-in-depth против анонимных вызовов
  select auth.uid() is not null
    and exists (
      select 1
      from public.admin_users au
      where au.user_id = auth.uid()
        and au.role = 'owner'
    );
$$;

revoke all on function private.is_owner() from public, anon, authenticated;
grant execute on function private.is_owner() to anon, authenticated;

-- =============================================================================
-- 4. Триггер защиты owner (многослойная защита: advisory lock + FOR UPDATE)
-- =============================================================================

-- 4.1 Функция-триггер
create or replace function private.admin_users_protect_owner()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  owners_count int;
begin
  -- Advisory lock сериализует параллельные транзакции внутри одной сессии БД
  perform pg_advisory_xact_lock(hashtext('admin_users_owner_protection'));

  -- Блокируем существующих owner'ов для подсчёта
  select count(*) into owners_count
  from public.admin_users
  where role = 'owner'
  for update;

  if tg_op = 'DELETE' then
    if old.role = 'owner' and owners_count <= 1 then
      raise exception 'cannot delete the last owner';
    end if;
    return old;
  end if;

  if tg_op = 'UPDATE' then
    -- Запрет понижения последнего owner'а
    if old.role = 'owner' and new.role <> 'owner' and owners_count <= 1 then
      raise exception 'cannot demote the last owner';
    end if;
    -- Запрет превращения editor в owner при существующем owner
    if old.role = 'editor' and new.role = 'owner' and owners_count >= 1 then
      raise exception 'an owner already exists';
    end if;
    -- Запрет reassign owner-строки другому user_id
    if old.role = 'owner' and new.user_id <> old.user_id then
      raise exception 'cannot reassign an owner row to another user';
    end if;
    return new;
  end if;

  if tg_op = 'INSERT' then
    if new.role = 'owner' and owners_count >= 1 then
      raise exception 'an owner already exists';
    end if;
    return new;
  end if;

  return null;
end;
$$;

revoke all on function private.admin_users_protect_owner() from public, anon, authenticated;

-- 4.2 Триггер на admin_users
drop trigger if exists admin_users_protect_owner_trg on public.admin_users;
create trigger admin_users_protect_owner_trg
  before insert or update or delete on public.admin_users
  for each row execute function private.admin_users_protect_owner();

-- =============================================================================
-- 5. Включение RLS на всех таблицах
-- =============================================================================
alter table public.members enable row level security;
alter table public.releases enable row level security;
alter table public.release_credits enable row level security;
alter table public.admin_users enable row level security;

-- =============================================================================
-- 6. RLS-политики
-- =============================================================================

-- ----- 6.1 members -----
drop policy if exists members_select_public on public.members;
create policy members_select_public on public.members
  for select to anon, authenticated
  using (is_published = true);

drop policy if exists members_admin_all on public.members;
create policy members_admin_all on public.members
  for all to authenticated
  using (private.is_admin())
  with check (private.is_admin());

-- ----- 6.2 releases -----
drop policy if exists releases_select_public on public.releases;
create policy releases_select_public on public.releases
  for select to anon, authenticated
  using (is_published = true);

drop policy if exists releases_admin_all on public.releases;
create policy releases_admin_all on public.releases
  for all to authenticated
  using (private.is_admin())
  with check (private.is_admin());

-- ----- 6.3 release_credits -----
drop policy if exists release_credits_select_public on public.release_credits;
create policy release_credits_select_public on public.release_credits
  for select to anon, authenticated
  using (
    exists (
      select 1 from public.releases r
      where r.id = release_credits.release_id
        and r.is_published = true
    )
  );

drop policy if exists release_credits_admin_all on public.release_credits;
create policy release_credits_admin_all on public.release_credits
  for all to authenticated
  using (private.is_admin())
  with check (private.is_admin());

-- ----- 6.4 admin_users -----
-- Пользователь видит свою строку; админы видят все
drop policy if exists admin_users_select_self on public.admin_users;
create policy admin_users_select_self on public.admin_users
  for select to authenticated
  using (user_id = auth.uid() or private.is_admin());

-- Управлять admin_users может только owner
drop policy if exists admin_users_owner_manage on public.admin_users;
create policy admin_users_owner_manage on public.admin_users
  for all to authenticated
  using (private.is_owner())
  with check (private.is_owner());

-- =============================================================================
-- 7. GRANT/REVOKE синхронизация с RLS
-- =============================================================================

revoke all on public.members, public.releases, public.release_credits, public.admin_users
  from anon, authenticated;

grant select on public.members, public.releases, public.release_credits
  to anon, authenticated;

grant insert, update, delete on public.members, public.releases, public.release_credits
  to authenticated;

grant select, insert, update, delete on public.admin_users
  to authenticated;

-- =============================================================================
-- Конец миграции
-- =============================================================================
