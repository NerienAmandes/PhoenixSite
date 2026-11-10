import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Статус участника. Соответствует колонке `member_status` в БД.
 *  - 'active'  — действующий участник (страница /team).
 *  - 'former'  — бывший участник (страница /team/former).
 *  - 'hidden'  — скрыт (не отображается на публичных страницах; виден в админке).
 */
export type MemberStatus = 'active' | 'former' | 'hidden'

/** Сырая строка из таблицы public.members (snake_case). */
export type DbMember = {
  id: string
  slug: string
  display_name: string
  role: string | null
  tags: string[]
  birth_mmdd: string | null
  bio: string | null
  avatar_path: string | null
  socials: Record<string, string>
  is_published: boolean
  member_status: MemberStatus
}

export type UseMembersOptions = {
  /**
   * Фильтр по `member_status`.
   *  - 'active' — только действующие (страница /team).
   *  - 'former' — только бывшие (страница /team/former).
   *  - 'all'    — действующие + бывшие (по умолчанию).
   *
   * Скрытые ('hidden') сюда не попадают — для них используйте `includeHidden: true`.
   */
  status?: 'active' | 'former' | 'all'
  /**
   * Включить ли мемберов со статусом 'hidden'.
   * Используйте только в админке: на публичных страницах RLS всё равно
   * скроет неопубликованных, но скрытые с `is_published=true` всё равно
   * не должны показываться зрителю.
   */
  includeHidden?: boolean
}

/**
 * Загружает участников команды из Supabase.
 * Источник правды: таблица `public.members` (см. миграцию 0001_init_schema.sql).
 *
 * На время первой загрузки возвращает пустой массив — UI рисует плейсхолдеры.
 *
 * RLS-политика `members_select_public` отдаёт только строки с `is_published = true`,
 * поэтому «прятать» мембера с сайта можно через админку, не удаляя строку.
 */
export function useMembers(options: UseMembersOptions = {}) {
  const { status = 'all', includeHidden = false } = options

  const [members, setMembers] = useState<DbMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)

    let query = supabase
      .from('members')
      .select('*')
      .order('display_name', { ascending: true })

    // Фильтр по статусу. RLS всё равно отрежет неопубликованных,
    // но явный фильтр экономит трафик и делает запрос детерминированным.
    if (status === 'active') {
      query = query.eq('member_status', 'active')
    } else if (status === 'former') {
      query = query.eq('member_status', 'former')
    } else if (!includeHidden) {
      // 'all' без hidden: берём явно active + former
      query = query.in('member_status', ['active', 'former'])
    }
    // 'all' + includeHidden=true: фильтр по member_status не ставим

    const { data, error: err } = await query

    if (err) {
      setError(err.message)
      setMembers([])
    } else {
      setMembers((data ?? []) as DbMember[])
    }
    setLoading(false)
  }, [status, includeHidden])

  useEffect(() => {
    void load()
  }, [load])

  return { members, loading, error, refetch: load }
}