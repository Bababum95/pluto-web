import { apiFetch, queryClient } from '@/lib/api'
import type {
  Account,
  AccountListResponseDto,
  AccountSummaryDto,
  AccountWithSummaryResponseDto,
  CreateAccountDto,
  UpdateAccountDto,
} from './types'

const BASE = 'accounts'
const QUERY_KEY = ['accounts'] as const

export const accountApi = {
  list: (): Promise<AccountListResponseDto> => apiFetch(BASE),
  summary: (): Promise<AccountSummaryDto> => apiFetch(`${BASE}/summary`),

  getById: (id: string): Promise<Account> => apiFetch(`${BASE}/${id}`),

  create: (data: CreateAccountDto): Promise<AccountWithSummaryResponseDto> =>
    apiFetch(BASE, { method: 'POST', body: JSON.stringify(data) }),

  update: (
    id: string,
    data: UpdateAccountDto
  ): Promise<AccountWithSummaryResponseDto> =>
    apiFetch(`${BASE}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  toggleExcluded: (id: string): Promise<AccountWithSummaryResponseDto> =>
    apiFetch(`${BASE}/excluded/${id}`, { method: 'PATCH' }),

  reorder: (data: { ids: string[] }): Promise<void> =>
    apiFetch(`${BASE}/reorder`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  invalidate: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  delete: (id: string): Promise<AccountSummaryDto> =>
    apiFetch(`${BASE}/${id}`, { method: 'DELETE' }),
}
