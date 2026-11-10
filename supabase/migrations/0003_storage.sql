-- 0003_storage.sql
-- Storage bucket `media` для аватаров участников и обложек релизов.
--
-- Применить в Supabase Dashboard → SQL Editor → New query → вставить → Run.
--
-- Поведение:
--   - bucket `media` публичный (SELECT разрешён всем, чтобы аватары/обложки
--     грузились на публичных страницах сайта).
--   - INSERT/UPDATE/DELETE — только админам (через private.is_admin()).
--   - Файлы рекомендуется класть в подпапки: `avatars/{slug}.jpg`,
--     `covers/{slug}.jpg`. Это не enforced, но удобно для порядка.
--
-- ВАЖНО: функция is_admin() находится в схеме `private` (см. миграцию
-- 0001_init_schema.sql). В политиках storage.objects к ней нужно обращаться
-- именно как к private.is_admin() — иначе получим
-- "function public.is_admin() does not exist".

-- 1. Создаём bucket `media` (public read). Идемпотентно.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  5242880, -- 5 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- 2. RLS для storage.objects.
-- public bucket сам по себе даёт SELECT всем анонимам через PostgREST,
-- но добавим явную политику для надёжности и аудита.

drop policy if exists "media_select_public" on storage.objects;
create policy "media_select_public"
  on storage.objects for select
  using ( bucket_id = 'media' );

-- 3. INSERT — только админам.
drop policy if exists "media_insert_admin" on storage.objects;
create policy "media_insert_admin"
  on storage.objects for insert
  with check (
    bucket_id = 'media'
    and private.is_admin()
  );

-- 4. UPDATE — только админам.
drop policy if exists "media_update_admin" on storage.objects;
create policy "media_update_admin"
  on storage.objects for update
  using ( bucket_id = 'media' and private.is_admin() )
  with check ( bucket_id = 'media' and private.is_admin() );

-- 5. DELETE — только админам.
drop policy if exists "media_delete_admin" on storage.objects;
create policy "media_delete_admin"
  on storage.objects for delete
  using ( bucket_id = 'media' and private.is_admin() );
