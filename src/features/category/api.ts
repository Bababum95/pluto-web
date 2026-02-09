import { apiFetch, queryClient } from '@/lib/api'
import type { Category, CreateCategoryDto, UpdateCategoryDto } from './types'

const BASE = 'categories'
const QUERY_KEY = ['categories'] as const

export const categoryApi = {
  list: (): Promise<Category[]> => apiFetch(BASE),

  getById: (id: string): Promise<Category> => apiFetch(`${BASE}/${id}`),

  create: (data: CreateCategoryDto): Promise<Category> =>
    apiFetch(BASE, { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: UpdateCategoryDto): Promise<Category> =>
    apiFetch(`${BASE}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  invalidate: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
}
