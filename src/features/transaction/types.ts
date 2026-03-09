import type { components, operations } from '@/lib/api/types'
import type { Account, AccountSummaryDto } from '@/features/account/types'

export type CreateTransactionDto = components['schemas']['CreateTransactionDto']
export type UpdateTransactionDto = Partial<CreateTransactionDto>
export type UpdateTransactionOptionsDto =
  operations['TransactionController_update']['parameters']['query']
export type Transaction = components['schemas']['TransactionDto']
export type TransactionFilterDto =
  operations['TransactionController_findAll']['parameters']['query']

export type TransactionFormType = Omit<
  CreateTransactionDto,
  'amount' | 'date' | 'type' | 'scale'
> & {
  amount: string
  date: Date
}

export type TransactionMutationResponse = {
  transaction: Transaction
  accounts: Account[]
  summary: AccountSummaryDto
}
