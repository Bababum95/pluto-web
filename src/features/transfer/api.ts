import { apiFetch, queryClient } from '@/lib/api'
import type { CreateTransferDto, Transfer, UpdateTransferDto } from './types'

const BASE = 'transfers'
const QUERY_KEY = ['transfers'] as const

export const transferApi = {
  list: (): Promise<Transfer[]> => apiFetch(BASE),

  getById: (id: string): Promise<Transfer> => apiFetch(`${BASE}/${id}`),

  create: (data: CreateTransferDto): Promise<Transfer> =>
    apiFetch(BASE, { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: UpdateTransferDto): Promise<Transfer> =>
    apiFetch(`${BASE}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string): Promise<void> =>
    apiFetch(`${BASE}/${id}`, { method: 'DELETE' }),

  invalidate: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
}
