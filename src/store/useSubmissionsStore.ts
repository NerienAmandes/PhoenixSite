import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Submission } from '../types'

interface SubmissionsState {
  submissions: Submission[]
  add: (sub: Omit<Submission, 'id' | 'createdAt'>) => Submission
  remove: (id: string) => void
}

export const useSubmissionsStore = create<SubmissionsState>()(
  persist(
    (set) => ({
      submissions: [],
      add: (sub) => {
        const created: Submission = {
          ...sub,
          id: `s_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          createdAt: new Date().toISOString(),
        }
        set((state) => ({ submissions: [created, ...state.submissions] }))
        return created
      },
      remove: (id) =>
        set((state) => ({ submissions: state.submissions.filter((s) => s.id !== id) })),
    }),
    { name: 'fp_submissions' }
  )
)
