import type { components, operations } from '@/lib/api/types'
import type { AccountWithSummaryResponseDto } from '@/features/account/types'

export type CreateTransactionDto = components['schemas']['CreateTransactionDto']
export type UpdateTransactionDto = components['schemas']['UpdateTransactionDto']
export type Transaction = components['schemas']['TransactionDto']
export type TransactionFilterDto =
  operations['TransactionController_findAll']['parameters']['query']

export type TransactionMutationResponse = AccountWithSummaryResponseDto & {
  transaction: Transaction
}
