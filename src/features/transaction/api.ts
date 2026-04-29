import { queryClient } from '@/lib/api'
import {
  transactionControllerCreate,
  transactionControllerFindAll,
  transactionControllerFindOne,
  transactionControllerRemove,
  transactionControllerUpdate,
} from '@/lib/api/generated/transactions/transactions'
import type {
  CreateTransactionDto,
  TransactionDto,
  TransactionMutationResponse,
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

  create: (data: CreateTransactionDto): Promise<TransactionMutationResponse> =>
    transactionControllerCreate(data).then(
      (response) => response as unknown as TransactionMutationResponse
    ),

  update: (
    id: string,
    data: UpdateTransactionDto,
    params?: Record<string, string>
  ): Promise<TransactionMutationResponse> =>
    transactionControllerUpdate(id, data, params).then(
      (response) => response as unknown as TransactionMutationResponse
    ),

  delete: (id: string): Promise<void> => transactionControllerRemove(id),

  invalidate: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
}
