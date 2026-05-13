import type {
  CreateTransactionDto,
  TransactionControllerFindAllParams,
  TransactionControllerUpdateParams,
  TransactionDto,
} from '@/shared/api/generated/model'
import type { AccountDto, AccountSummaryDto } from '@/entities/account/model/types'

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
  account: AccountDto
  summary: AccountSummaryDto
}

export type {
  CreateTransactionDto,
  TransactionControllerFindAllParams,
  TransactionControllerUpdateParams,
  TransactionDto,
}
