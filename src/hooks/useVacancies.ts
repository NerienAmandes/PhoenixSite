import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Vacancy } from '../types'

/**
 * Загружает открытые вакансии из Supabase.
 * Источник правды: таблица `public.vacancies` (см. миграцию 0007_vacancies.sql).
 *
 * RLS-политика `vacancies_select_public` отдаёт только строки с `is_open = true`,
 * поэтому закрывать/открывать вакансии можно прямо в админке.
 */
export function useVacancies() {
  const [vacancies, setVacancies] = useState<Vacancy[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      const { data, error } = await supabase
        .from('vacancies')
        .select('*')
        .eq('is_open', true)
        .order('sort_order', { ascending: true })

      if (cancelled) return

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      const mapped: Vacancy[] = (data || []).map((v: any) => ({
        id: v.slug,
        role: v.role,
        requirements: v.requirements ?? [],
        conditions: v.conditions,
        isOpen: v.is_open,
      }))

      setVacancies(mapped)
      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  return { vacancies, loading, error }
}