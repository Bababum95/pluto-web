import { apiFetch, queryClient } from '@/lib/api'
import type {
  Account,
  AccountListResponseDto,
  AccountSummaryDto,
  CreateAccountDto,
  UpdateAccountDto,
} from './types'

const BASE = 'accounts'
const QUERY_KEY = ['accounts'] as const

export const accountApi = {
  list: (): Promise<AccountListResponseDto> => apiFetch(BASE),
  summary: (): Promise<AccountSummaryDto> => apiFetch(`${BASE}/summary`),

  getById: (id: string): Promise<Account> => apiFetch(`${BASE}/${id}`),

  create: (data: CreateAccountDto): Promise<Account> =>
    apiFetch(BASE, { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: UpdateAccountDto): Promise<Account> =>
    apiFetch(`${BASE}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  invalidate: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
}
