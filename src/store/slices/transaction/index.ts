import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import { toDecimal } from '@/features/money/utils/toDecimal'
import type { Transaction } from '@/features/transaction/types'

import {
  createTransaction,
  deleteTransaction,
  fetchTransactions,
  updateTransaction,
} from './async-thunks'
import type { TransactionState } from './types'

const initialState: TransactionState = {
  transactions: [],
  summary: null,
  status: 'idle',
}

const countTotal = (transactions: Transaction[]) => {
  return transactions.reduce((acc, t) => acc + t.amount.converted.raw, 0)
}

export const transactionSlice = createSlice({
  name: 'transaction',
  initialState,
  reducers: {
    setTransactions: (state, action: PayloadAction<Transaction[]>) => {
      state.transactions = action.payload
    },
    addTransaction: (state, action: PayloadAction<Transaction>) => {
      state.transactions.push(action.payload)
    },
    updateTransactionLocal: (state, action: PayloadAction<Transaction>) => {
      const idx = state.transactions.findIndex(
        (t) => t.id === action.payload.id
      )
      if (idx !== -1) {
        state.transactions[idx] = action.payload
      }
    },
    removeTransaction: (state, action: PayloadAction<string>) => {
      state.transactions = state.transactions.filter(
        (t) => t.id !== action.payload
      )
    },
    clearTransactions: (state) => {
      state.transactions = []
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state, action) => {
        state.status = 'pending'

        if (action.meta.arg?.clear) {
          state.transactions = []
          state.summary = state.summary
            ? { ...state.summary, total: 0, total_raw: 0 }
            : null
        }
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.status = 'success'
        state.transactions = action.payload
        const data = action.payload[0]?.amount?.converted
        const scale = data?.scale ?? 0

        const total_raw = countTotal(action.payload)
        state.summary = {
          scale,
          total_raw,
          total: toDecimal(total_raw, scale),
          currency: data?.currency,
        }
      })
      .addCase(fetchTransactions.rejected, (state) => {
        state.status = 'failed'
      })
      .addCase(createTransaction.pending, (state) => {
        state.status = 'pending'
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.status = 'success'

        if (!action.payload.insert) return

        const transaction = action.payload.transaction
        state.transactions.unshift(transaction)

        if (state.summary) {
          const total_raw = countTotal(state.transactions)
          state.summary = {
            ...state.summary,
            total_raw,
            total: toDecimal(total_raw, transaction.amount.converted.scale),
          }
        } else {
          state.summary = {
            scale: transaction.amount.converted.scale,
            total_raw: transaction.amount.converted.raw,
            total: transaction.amount.converted.value,
            currency: transaction.amount.converted.currency,
          }
        }
      })
      .addCase(createTransaction.rejected, (state) => {
        state.status = 'failed'
      })
      .addCase(updateTransaction.fulfilled, (state, action) => {
        const idx = state.transactions.findIndex(
          (t) => t.id === action.payload.id
        )
        if (idx !== -1) {
          state.transactions[idx] = action.payload
        }
      })
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.transactions = state.transactions.filter(
          (t) => t.id !== action.meta.arg
        )
      })
  },
})

export const {
  setTransactions,
  addTransaction,
  updateTransactionLocal,
  removeTransaction,
  clearTransactions,
} = transactionSlice.actions

export * from './selectors'
export * from './async-thunks'
export default transactionSlice.reducer
