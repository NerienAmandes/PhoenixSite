import { useEffect, useState } from 'react'
import { supabase, publicUrl } from '../lib/supabase'
import type { Release } from '../types'

/**
 * Загружает опубликованные релизы из Supabase и маппит поля snake_case → camelCase.
 * Используется и на главной, и на странице «Релизы».
 */
export function useReleases() {
  const [releases, setReleases] = useState<Release[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      const { data, error } = await supabase
        .from('releases')
        .select('*')
        .eq('is_published', true)
        .order('release_date', { ascending: false, nullsFirst: true })

      if (cancelled) return

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      const mapped: Release[] = (data || []).map((r: any) => ({
        id: r.slug,
        title: r.title,
        originalArtist: r.original_artist || 'Неизвестный исполнитель',
        cover: r.cover_url?.startsWith('http')
          ? r.cover_url
          : publicUrl(r.cover_url) || '',
        releaseDate: r.release_date || '',
        status: r.status,
        platforms: r.platforms || {},
        currentStage: r.current_stage ?? 0,
        description: r.description || '',
      }))

      setReleases(mapped)
      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const upcoming = releases.filter((r) => r.status === 'upcoming').slice(0, 6)
  const released = releases
    .filter((r) => r.status === 'released' && r.platforms.youtube)
    .sort((a, b) => +new Date(b.releaseDate) - +new Date(a.releaseDate))

  return { releases, upcoming, released, loading, error }
}