import type { Status } from '@/shared/lib/async-status'
import type {
  CreateTransactionDto,
  TransactionControllerFindAllParams,
  TransactionControllerUpdateParams,
  TransactionMutationResponseDto,
  TransactionDto,
} from '@/shared/api/generated/model'

export type UpdateTransactionDto = Partial<CreateTransactionDto>

export type TransactionFormType = Omit<
  CreateTransactionDto,
  'amount' | 'date' | 'type' | 'scale'
> & {
  amount: string
  date: Date
}

export type TransactionState = {
  transactions: TransactionDto[]
  status: Status
  current: TransactionDto | null
  summary: {
    total: number
    total_raw: number
    scale: number
    currency: {
      code: string
      symbol: string
      decimal_digits: number
    }
  } | null
}

export type {
  CreateTransactionDto,
  TransactionControllerFindAllParams,
  TransactionControllerUpdateParams,
  TransactionMutationResponseDto,
  TransactionDto,
}
