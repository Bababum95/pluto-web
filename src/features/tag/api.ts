import { apiFetch, queryClient } from '@/lib/api'
import type { Tag, TagFormValues } from './types'

const BASE = 'tags'
const QUERY_KEY = ['tags'] as const

export const tagApi = {
  list: (): Promise<Tag[]> => apiFetch(BASE),

  getById: (id: string): Promise<Tag> => apiFetch(`${BASE}/${id}`),

  create: (data: TagFormValues): Promise<Tag> =>
    apiFetch(BASE, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: TagFormValues): Promise<Tag> =>
    apiFetch(`${BASE}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string): Promise<void> =>
    apiFetch(`${BASE}/${id}`, { method: 'DELETE' }),

  invalidate: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
}
