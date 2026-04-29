import { queryClient } from '@/lib/api'
import {
  accountControllerCreate,
  accountControllerFindAll,
  accountControllerFindOne,
  accountControllerGetSummary,
  accountControllerReorder,
  accountControllerRemove,
  accountControllerToggleExcluded,
  accountControllerUpdate,
} from '@/lib/api/generated/accounts/accounts'
import type {
  AccountDto,
  AccountListResponseDto,
  AccountSummaryDto,
  AccountWithSummaryResponseDto,
  CreateAccountDto,
  UpdateAccountDto,
} from './types'

const QUERY_KEY = ['accounts'] as const

const ensureAccountWithSummary = (
  payload: Partial<AccountWithSummaryResponseDto>
): AccountWithSummaryResponseDto => {
  if (!payload.account || !payload.summary) {
    throw new Error('Account response is missing required fields')
  }

  return {
    account: payload.account,
    summary: payload.summary,
  }
}

const ensureAccountListResponse = (
  payload: Partial<AccountListResponseDto>
): AccountListResponseDto => {
  if (!payload.list || !payload.summary) {
    throw new Error('Accounts response is missing required fields')
  }

  return {
    list: payload.list,
    summary: payload.summary,
  }
}

export const accountApi = {
  list: (): Promise<AccountListResponseDto> =>
    accountControllerFindAll().then(ensureAccountListResponse),
  summary: (): Promise<AccountSummaryDto> => accountControllerGetSummary(),

  getById: (id: string): Promise<AccountDto> => accountControllerFindOne(id),

  create: (data: CreateAccountDto): Promise<AccountWithSummaryResponseDto> =>
    accountControllerCreate(data).then(ensureAccountWithSummary),

  update: (
    id: string,
    data: UpdateAccountDto
  ): Promise<AccountWithSummaryResponseDto> =>
    accountControllerUpdate(id, data).then(ensureAccountWithSummary),

  toggleExcluded: (id: string): Promise<AccountWithSummaryResponseDto> =>
    accountControllerToggleExcluded(id).then(ensureAccountWithSummary),

  reorder: (data: { ids: string[] }): Promise<void> =>
    accountControllerReorder(data).then(() => undefined),

  invalidate: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  delete: (id: string): Promise<AccountSummaryDto> =>
    accountControllerRemove(id),
}
