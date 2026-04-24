import { apiFetch, queryClient } from '@/lib/api'
import type {
  CreateTransferDto,
  Transfer,
  TransferFilterDto,
  UpdateTransferDto,
} from './types'

const BASE = 'transfers'
const QUERY_KEY = ['transfers'] as const

type ListOptions = { signal?: AbortSignal }

export const transferApi = {
  list: (filters?: TransferFilterDto, options?: ListOptions): Promise<Transfer[]> =>
    apiFetch(BASE, { params: filters, ...options }),

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
