-- =============================================================================
-- 0006_services.sql
-- Таблица услуг (адаптации текста и каверы).
--
-- Раньше жило в `src/data/services.ts`. Чтобы редактировать описание
-- пакета без пересборки фронта — перенесли в Supabase.
--
-- Структура:
--   slug           — стабильный идентификатор ('lyrics', 'lyrics_vocal',
--                    'cover', и т.п.). Используется как PK и в URL админки.
--   sort_order     — порядок отображения на странице «Услуги».
--   includes[]     — что входит в пакет (массив строк).
--   price          — текстовое поле ("от 500 ₽"), намеренно не decimal:
--                    цена может быть диапазоном или зависеть от объёма.
--   is_published   — мягкое скрытие услуги без удаления (используется на сайте).
-- =============================================================================

create table if not exists public.services (
  slug text primary key,
  title text not null,
  description text not null,
  includes text[] not null default '{}',
  price text not null,
  turnaround text not null,
  sort_order smallint not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists services_sort_idx
  on public.services (sort_order)
  where is_published = true;

alter table public.services enable row level security;

-- Публичный SELECT только опубликованных (аналогично releases/members).
drop policy if exists services_select_public on public.services;
create policy services_select_public on public.services
  for select to anon, authenticated
  using (is_published = true);

drop policy if exists services_admin_all on public.services;
create policy services_admin_all on public.services
  for all to authenticated
  using (private.is_admin())
  with check (private.is_admin());

revoke all on public.services from anon, authenticated;
grant select on public.services to anon, authenticated;
grant insert, update, delete on public.services to authenticated;

-- =============================================================================
-- Сид: перенос текущих пакетов из src/data/services.ts
-- (выполняется при первом накатывании миграции; повторные накатывания — no-op)
-- =============================================================================
insert into public.services (slug, title, description, includes, price, turnaround, sort_order) values
  (
    'lyrics',
    'Адаптация зарубежного трека на русский',
    'Берём оригинальный текст и превращаем его в живой, естественно звучащий русский. Не подстрочник — а полноценная песня, которую хочется петь.',
    array[
      'Смысловой перевод с сохранением ритма и размера',
      'Подбор рифм под мелодию',
      'Бесплатная корректировка по вашим замечаниям',
      'Готовый текст в формате .docx и .pdf'
    ],
    'от 500 ₽',
    'от 3 дней',
    10
  ),
  (
    'lyrics_vocal',
    'Адаптация + пропевка',
    'Всё из базовой адаптации плюс голосовая демо-запись: наш текстовик сам напевает, как текст ложится на мелодию. Удобно, если у вас пока нет своего вокалиста и нужно понять ритм и интонирование.',
    array[
      'Всё из пакета «Адаптация»',
      'Демо-пропевка голосом с мелодией оригинала',
      'Тайм-код по фрагментам для удобства записи',
      'Готовый MP3 с напевкой'
    ],
    'от 600 ₽',
    'от 3 дней',
    20
  )
on conflict (slug) do nothing;