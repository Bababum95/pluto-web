import type { AppDispatch } from '@/app/store'
import { updateAccountInState, setSummary } from '@/entities/account'
import type {
  AccountDto,
  AccountSummaryDto,
} from '@/entities/account/model/types'

export type TransactionMutationSideEffects = {
  accounts?: AccountDto[]
  summary?: AccountSummaryDto
}

export function applyTransactionMutationSideEffects(
  dispatch: AppDispatch,
  response: TransactionMutationSideEffects
): void {
  const accounts = response.accounts ?? []
  for (const account of accounts) {
    dispatch(updateAccountInState(account))
  }
  if (response.summary) {
    dispatch(setSummary(response.summary))
  }
}
