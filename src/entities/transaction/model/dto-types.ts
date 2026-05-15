import type {
  CreateTransactionDto,
  TransactionControllerFindAllParams,
  TransactionControllerUpdateParams,
  TransactionDto,
} from '@/shared/api/generated/model'
export type UpdateTransactionDto = Partial<CreateTransactionDto>
export type UpdateTransactionOptionsDto = TransactionControllerUpdateParams

export type TransactionFormType = Omit<
  CreateTransactionDto,
  'amount' | 'date' | 'type' | 'scale'
> & {
  amount: string
  date: Date
}

export type { TransactionMutationResponseDto as TransactionMutationResponse } from '@/shared/api/generated/model'
export type {
  CreateTransactionDto,
  TransactionControllerFindAllParams,
  TransactionControllerUpdateParams,
  TransactionDto,
}
