import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from '@reduxjs/toolkit'

import { transactionApi } from '@/features/transaction'
import { getTimeRangeBounds } from '@/features/time-range'
import type {
  CreateTransactionDto,
  Transaction,
  UpdateTransactionDto,
} from '@/features/transaction/types'
import { toDecimal } from '@/features/money/utils/toDecimal'
import type { RootState } from '@/store'
import type { Status } from '@/lib/types'

type TransactionState = {
  transactions: Transaction[]
  status: Status
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

const initialState: TransactionState = {
  transactions: [],
  summary: null,
  status: 'idle',
}

type FetchTransactionsPayload = {
  clear?: boolean
}

export const fetchTransactions = createAsyncThunk(
  'transaction/fetchTransactions',
  (_payload: FetchTransactionsPayload | undefined, { getState }) => {
    const rootState = getState() as RootState
    const { timeRange, timeRangeIndex } = rootState.timeRange
    const bounds = getTimeRangeBounds(timeRange, timeRangeIndex)

    return transactionApi.list({
      type: rootState.transactionType.transactionType,
      from: bounds.from,
      to: bounds.to,
    })
  }
)

export const createTransaction = createAsyncThunk(
  'transaction/createTransaction',
  (data: Omit<CreateTransactionDto, 'type'>, { getState }) => {
    const rootState = getState() as RootState
    return transactionApi.create({
      ...data,
      type: rootState.transactionType.transactionType,
    })
  }
)

export const updateTransaction = createAsyncThunk(
  'transaction/updateTransaction',
  ({ id, data }: { id: string; data: UpdateTransactionDto }) =>
    transactionApi.update(id, data)
)

export const deleteTransaction = createAsyncThunk(
  'transaction/deleteTransaction',
  (id: string) => transactionApi.delete(id)
)

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
        const data = action.payload[0]?.amount?.converted ?? state.summary
        const scale = data?.scale ?? 0

        const total = countTotal(action.payload)
        state.summary = {
          total,
          scale,
          total_raw: toDecimal(total, scale),
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
        state.transactions.push(action.payload.transaction)
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
export default transactionSlice.reducer
