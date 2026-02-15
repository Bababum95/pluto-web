import { createSelector } from '@reduxjs/toolkit'

import type { Transaction } from '@/features/transaction/types'
import type { Category } from '@/features/category/types'
import type { RootState } from '@/store'

export const selectTransactions = (state: RootState) =>
  state.transaction.transactions
export const selectTransactionsStatus = (state: RootState) =>
  state.transaction.status
export const selectTransactionsSummary = (state: RootState) =>
  state.transaction.summary
export const selectTransactionById = (id: string) => (state: RootState) =>
  state.transaction.transactions.find((t) => t.id === id)

type TransactionsByCategory = {
  list: Omit<Transaction, 'category'>[]
  total: number
  scale: number
  category: Category
}

export const selectTransactionsByCategory = createSelector(
  selectTransactions,
  (transactions): TransactionsByCategory[] => {
    const data: Record<string, TransactionsByCategory> = {}

    for (const { category, ...transaction } of transactions) {
      const categoryKey = typeof category === 'string' ? category : category.id
      const converted = transaction.amount.converted

      if (!data[categoryKey]) {
        data[categoryKey] = {
          list: [],
          total: 0,
          category,
          scale: converted.scale,
        }
      }

      data[categoryKey].list.push(transaction)

      // We assume `amount.raw` is the smallest unit (integer)
      data[categoryKey].total += converted.raw
    }

    return Object.values(data)
  }
)
