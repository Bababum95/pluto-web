import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import {
  DEFAULT_TRANSACTION_TYPE,
  TRANSACTION_TYPES,
} from '@/shared/config/transaction-types'
import type { TransactionType } from '@/shared/config/transaction-types'
import type { RootState } from '../../store'

/**
 * Global UI filter for income/expense tabs (not domain entity state).
 * Lives under app/store per FSD — consumed by routes and list filters.
 */
type TransactionTypeState = {
  transactionType: TransactionType
}

const initialState: TransactionTypeState = {
  transactionType: DEFAULT_TRANSACTION_TYPE,
}

function isTab(value: string): value is TransactionType {
  return (TRANSACTION_TYPES as readonly string[]).includes(value)
}

export const transactionTypeSlice = createSlice({
  name: 'transactionType',
  initialState,
  reducers: {
    setTransactionType: (state, action: PayloadAction<string>) => {
      if (isTab(action.payload)) {
        state.transactionType = action.payload
      }
    },
  },
})

export const { setTransactionType } = transactionTypeSlice.actions

export const selectTransactionType = (state: RootState) =>
  state.transactionType.transactionType

export default transactionTypeSlice.reducer
