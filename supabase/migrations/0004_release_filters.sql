-- =============================================================================
-- 0004_release_filters.sql
-- Добавление колонки `original_language` в таблицу releases.
--
-- Нужно для фильтрации на странице «Релизы» по языку оригинала.
-- Свободный текст (например, "English", "Korean", "Japanese"), нормализация
-- на клиенте. Если хочется — потом можно заменить на справочник.
--
-- Безопасно для существующих строк: колонка nullable.
-- =============================================================================

alter table public.releases
  add column if not exists original_language text;

-- Индекс покрывает фильтр по языку с сортировкой по дате
-- (используется на странице «Релизы»).
create index if not exists releases_original_language_idx
  on public.releases (original_language)
  where original_language is not null and is_published = true;

-- Существующие RLS-политики уже разрешают SELECT для anon/authenticated по
-- is_published = true, отдельная политика для новой колонки не нужна —
-- RLS оперирует на уровне строк, а не колонок.