import { apiFetch, queryClient } from '@/lib/api'
import type {
  CreateTransactionDto,
  Transaction,
  TransactionMutationResponse,
  UpdateTransactionDto,
  TransactionFilterDto,
} from './types'

const BASE = 'transactions'
const QUERY_KEY = ['transactions'] as const

type ListOptions = { signal?: AbortSignal }

export const transactionApi = {
  list: (
    filters?: TransactionFilterDto,
    options?: ListOptions
  ): Promise<Transaction[]> => apiFetch(BASE, { params: filters, ...options }),

  getById: (id: string): Promise<Transaction> => apiFetch(`${BASE}/${id}`),

  create: (data: CreateTransactionDto): Promise<TransactionMutationResponse> =>
    apiFetch(BASE, { method: 'POST', body: JSON.stringify(data) }),

  update: (
    id: string,
    data: UpdateTransactionDto,
    params?: Record<string, string>
  ): Promise<TransactionMutationResponse> =>
    apiFetch(`${BASE}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
      params,
    }),

  delete: (id: string): Promise<void> =>
    apiFetch(`${BASE}/${id}`, { method: 'DELETE' }),

  invalidate: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
}
