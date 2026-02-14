import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from '@reduxjs/toolkit'

import { transactionApi } from '@/features/transaction'
import type {
  CreateTransactionDto,
  Transaction,
  UpdateTransactionDto,
} from '@/features/transaction/types'
import type { RootState } from '@/store'
import type { Status } from '@/lib/types'

type TransactionState = {
  transactions: Transaction[]
  status: Status
}

const initialState: TransactionState = {
  transactions: [],
  status: 'idle',
}

export const fetchTransactions = createAsyncThunk(
  'transaction/fetchTransactions',
  () => transactionApi.list()
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
      .addCase(fetchTransactions.pending, (state) => {
        state.status = 'pending'
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.status = 'success'
        state.transactions = action.payload
      })
      .addCase(fetchTransactions.rejected, (state) => {
        state.status = 'failed'
      })
      .addCase(createTransaction.pending, (state) => {
        state.status = 'pending'
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.status = 'success'
        state.transactions.push(action.payload)
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

export const selectTransactions = (state: RootState) =>
  state.transaction.transactions
export const selectTransactionsStatus = (state: RootState) =>
  state.transaction.status
export const selectTransactionById = (id: string) => (state: RootState) =>
  state.transaction.transactions.find((t) => t.id === id)

export default transactionSlice.reducer
