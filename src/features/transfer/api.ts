import { queryClient } from '@/lib/api'
import {
  transferControllerCreate,
  transferControllerFindAll,
  transferControllerFindOne,
  transferControllerRemove,
  transferControllerUpdate,
} from '@/lib/api/generated/transfers/transfers'
import type {
  CreateTransferDto,
  TransferDto,
  TransferControllerFindAllParams,
  UpdateTransferDto,
} from './types'

type ListOptions = { signal?: AbortSignal }
const QUERY_KEY = ['transfers'] as const

export const transferApi = {
  list: (
    filters?: TransferControllerFindAllParams,
    options?: ListOptions
  ): Promise<TransferDto[]> =>
    transferControllerFindAll(filters, undefined, options?.signal),

  getById: (id: string): Promise<TransferDto> => transferControllerFindOne(id),

  create: (data: CreateTransferDto): Promise<TransferDto> =>
    transferControllerCreate(data),

  update: (id: string, data: UpdateTransferDto): Promise<TransferDto> =>
    transferControllerUpdate(id, data),

  delete: (id: string): Promise<void> => transferControllerRemove(id),

  invalidate: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
}
