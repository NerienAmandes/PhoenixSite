import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export type CoverStageId =
  | 'lyrics'
  | 'vocal'
  | 'back-vocal'
  | 'tuning'
  | 'mixing'
  | 'art'
  | 'video'

export type DbCoverStage = {
  id: CoverStageId
  title: string
  description: string
  base_price: number
  sort_order: number
  is_published: boolean
}

/** UI-формат этапа (camelCase, как ожидает фронтенд). */
export type CoverStage = {
  id: CoverStageId
  title: string
  description: string
  basePrice: number
}

/**
 * Загружает этапы создания кавера из Supabase.
 * Раньше жило в src/types/index.ts как COVER_STAGES.
 */
export function useCoverStages() {
  const [stages, setStages] = useState<CoverStage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('cover_stages')
      .select('*')
      .eq('is_published', true)
      .order('sort_order', { ascending: true })

    if (err) {
      setError(err.message)
      setStages([])
    } else {
      const mapped: CoverStage[] = (data ?? []).map((s: DbCoverStage) => ({
        id: s.id,
        title: s.title,
        description: s.description,
        basePrice: s.base_price,
      }))
      setStages(mapped)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return { stages, loading, error, refetch: load }
}