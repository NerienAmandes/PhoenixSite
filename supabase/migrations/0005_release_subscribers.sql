-- =============================================================================
-- 0005_release_subscribers.sql
-- Подписчики на уведомления о новых релизах через Telegram-бот.
--
-- Таблица управляется ТОЛЬКО через /api/telegram-bot (service_role)
-- и `/api/notify-new-release`. Публичный доступ запрещён.
--
-- Поля:
--   chat_id        — Telegram chat_id, по нему же PK (один чат = одна строка).
--   username       — @username в Telegram (опционально, может меняться).
--   first_name     — имя из профиля Telegram на момент подписки.
--   active         — подписан ли сейчас. /stop деактивирует, не удаляет.
--   created_at     — когда подписался.
--   updated_at     — когда последний раз что-то меняли.
--   last_notified  — когда в последний раз слали уведомление (для антиспама).
-- =============================================================================

create table if not exists public.release_subscribers (
  chat_id bigint primary key,
  username text,
  first_name text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_notified timestamptz
);

-- Быстрый SELECT активных при рассылке — частичный индекс.
create index if not exists release_subscribers_active_idx
  on public.release_subscribers (chat_id)
  where active = true;

-- RLS включён, но без политик — никто из anon/authenticated не видит таблицу.
-- Запись/чтение — только через service_role в serverless-функциях Vercel.
alter table public.release_subscribers enable row level security;

-- Явные политики-для-всего-пустоты — без них RLS по-умолчанию всё запрещает,
-- но оставим комментарий для ясности: никаких политик, доступ только service_role.
revoke all on public.release_subscribers from anon, authenticated;