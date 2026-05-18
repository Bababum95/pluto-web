import { queryClient } from '@/shared/api'
import {
  transactionControllerCreate,
  transactionControllerFindAll,
  transactionControllerFindOne,
  transactionControllerRemove,
  transactionControllerUpdate,
} from '@/shared/api/generated/transactions/transactions'
import type {
  CreateTransactionDto,
  TransactionDto,
  TransactionMutationResponseDto,
  UpdateTransactionDto,
  TransactionControllerFindAllParams,
} from './types'

const QUERY_KEY = ['transactions'] as const

type ListOptions = { signal?: AbortSignal }

export const transactionApi = {
  list: (
    filters?: TransactionControllerFindAllParams,
    options?: ListOptions
  ): Promise<TransactionDto[]> =>
    transactionControllerFindAll(filters, undefined, options?.signal),

  getById: (id: string): Promise<TransactionDto> =>
    transactionControllerFindOne(id),

  create: (
    data: CreateTransactionDto
  ): Promise<TransactionMutationResponseDto> =>
    transactionControllerCreate(data),

  update: (
    id: string,
    data: UpdateTransactionDto,
    params?: Record<string, string>
  ): Promise<TransactionMutationResponseDto> =>
    transactionControllerUpdate(id, data, params),

  delete: (id: string): Promise<void> => transactionControllerRemove(id),

  invalidate: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
}
