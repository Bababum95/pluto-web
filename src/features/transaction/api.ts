import { apiFetch, queryClient } from '@/lib/api'
import type { CreateTransactionDto, Transaction, UpdateTransactionDto } from './types'

const BASE = 'transactions'
const QUERY_KEY = ['transactions'] as const

export const transactionApi = {
  list: (): Promise<Transaction[]> => apiFetch(BASE),

  getById: (id: string): Promise<Transaction> => apiFetch(`${BASE}/${id}`),

  create: (data: CreateTransactionDto): Promise<Transaction> =>
    apiFetch(BASE, { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: UpdateTransactionDto): Promise<Transaction> =>
    apiFetch(`${BASE}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string): Promise<void> =>
    apiFetch(`${BASE}/${id}`, { method: 'DELETE' }),

  invalidate: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
}
