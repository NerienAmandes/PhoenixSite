import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export type AdaptationPrice = {
  id: string
  size: string
  duration: string
  price: string
  japanesePrice: string
}

export type PriceFactor = {
  id: string
  title: string
  content: string
}

export type WorkCondition = {
  id: string
  title: string
  content: string
}

export function useLyricsServiceDetails() {
  const [prices, setPrices] = useState<AdaptationPrice[]>([])
  const [factors, setFactors] = useState<PriceFactor[]>([])
  const [conditions, setConditions] = useState<WorkCondition[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [pricesRes, factorsRes, conditionsRes] = await Promise.all([
        supabase.from('adaptation_prices').select('*').order('sort_order', { ascending: true }),
        supabase.from('price_factors').select('*').order('sort_order', { ascending: true }),
        supabase.from('work_conditions').select('*').order('sort_order', { ascending: true }),
      ])

      if (pricesRes.error) throw pricesRes.error
      if (factorsRes.error) throw factorsRes.error
      if (conditionsRes.error) throw conditionsRes.error

      setPrices((pricesRes.data || []).map((p: any) => ({
        id: p.id,
        size: p.size,
        duration: p.duration,
        price: p.price,
        japanesePrice: p.japanese_price,
      })))

      setFactors((factorsRes.data || []).map((f: any) => ({
        id: f.id,
        title: f.title,
        content: f.content,
      })))

      setConditions((conditionsRes.data || []).map((c: any) => ({
        id: c.id,
        title: c.title,
        content: c.content,
      })))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { prices, factors, conditions, loading, error, refetch: load }
}