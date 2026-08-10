import { releases } from '../data/releases'
import type { Release } from '../types'

/** Все релизы, в которых участник указан в credits. */
export function getMemberReleases(memberId: string): Release[] {
  return releases.filter((r) => r.credits?.includes(memberId))
}
