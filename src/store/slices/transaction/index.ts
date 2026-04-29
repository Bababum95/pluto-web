import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import { toDecimal } from '@/features/money/utils/toDecimal'
import type { TransactionDto } from '@/features/transaction/types'

import {
  createTransaction,
  deleteTransaction,
  fetchTransactions,
  updateTransaction,
  setCurrent,
} from './async-thunks'
import type { TransactionState } from './types'

const initialState: TransactionState = {
  transactions: [],
  current: null,
  summary: null,
  status: 'idle',
}

const countTotal = (transactions: TransactionDto[]) => {
  return transactions.reduce((acc, t) => acc + t.amount.converted.raw, 0)
}

export const transactionSlice = createSlice({
  name: 'transaction',
  initialState,
  reducers: {
    setTransactions: (state, action: PayloadAction<TransactionDto[]>) => {
      state.transactions = action.payload
    },
    addTransaction: (state, action: PayloadAction<TransactionDto>) => {
      state.transactions.push(action.payload)
    },
    updateTransactionLocal: (state, action: PayloadAction<TransactionDto>) => {
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
      .addCase(fetchTransactions.rejected, (state, action) => {
        if (action.error.name === 'AbortError') {
          return
        }
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
        const transaction = action.payload.transaction
        const idx = state.transactions.findIndex((t) => t.id === transaction.id)
        if (idx !== -1) {
          state.transactions[idx] = transaction
        }
      })
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.transactions = state.transactions.filter(
          (t) => t.id !== action.meta.arg
        )
      })
      .addCase(setCurrent.pending, (state, action) => {
        if (action.meta.arg !== state.current?.id) {
          state.current = null
        }
      })
      .addCase(setCurrent.fulfilled, (state, action) => {
        if (action.meta.arg !== state.current?.id) {
          state.current = action.payload
        }
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
