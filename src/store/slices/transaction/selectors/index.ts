import { createSelector } from '@reduxjs/toolkit'

import type { Transaction } from '@/features/transaction/types'
import type { RootState } from '@/store'

export const selectTransactions = (state: RootState) =>
  state.transaction.transactions
export const selectTransactionsStatus = (state: RootState) =>
  state.transaction.status
export const selectTransactionsSummary = (state: RootState) =>
  state.transaction.summary
export const selectTransactionById = (id: string) => (state: RootState) =>
  state.transaction.transactions.find((t) => t.id === id)

export const selectTransactionsGroupedByCategory = createSelector(
  selectTransactions,
  (transactions) => {
    return transactions.reduce<Record<string, Transaction[]>>(
      (acc, transaction) => {
        const categoryKey =
          typeof transaction.category === 'string'
            ? transaction.category
            : transaction.category.id

        if (!acc[categoryKey]) {
          acc[categoryKey] = []
        }

        acc[categoryKey].push(transaction)
        return acc
      },
      {}
    )
  }
)
