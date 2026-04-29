import type {
  CreateTransactionDto,
  TransactionControllerFindAllParams,
  TransactionControllerUpdateParams,
  TransactionDto,
} from '@/lib/api/generated/model'
import type { AccountDto, AccountSummaryDto } from '@/features/account/types'

export type UpdateTransactionDto = Partial<CreateTransactionDto>
export type UpdateTransactionOptionsDto = TransactionControllerUpdateParams

export type TransactionFormType = Omit<
  CreateTransactionDto,
  'amount' | 'date' | 'type' | 'scale'
> & {
  amount: string
  date: Date
}

export type TransactionMutationResponse = {
  transaction: TransactionDto
  accounts: AccountDto[]
  summary: AccountSummaryDto
}

export type {
  CreateTransactionDto,
  TransactionControllerFindAllParams,
  TransactionDto,
}
