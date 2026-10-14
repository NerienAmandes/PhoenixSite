import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Service } from '../types'

/**
 * Загружает опубликованные услуги из Supabase.
 * Источник правды: таблица `public.services` (см. миграцию 0006_services.sql).
 *
 * На время первой загрузки возвращает пустой массив — UI рисует плейсхолдеры.
 */
export function useServices() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_published', true)
        .order('sort_order', { ascending: true })

      if (cancelled) return

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      const mapped: Service[] = (data || []).map((s: any) => ({
        id: s.slug,
        title: s.title,
        description: s.description,
        includes: s.includes ?? [],
        price: s.price,
        turnaround: s.turnaround,
      }))

      setServices(mapped)
      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  return { services, loading, error }
}