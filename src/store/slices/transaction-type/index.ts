import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import { DEFAULT_TAB, TABS } from '@/features/transaction-type/constants'
import type { TransactionType } from '@/features/transaction-type/types'
import type { RootState } from '@/store'

type TransactionTypeState = {
  transactionType: TransactionType
}

const initialState: TransactionTypeState = {
  transactionType: DEFAULT_TAB,
}

function isTab(value: string): value is TransactionType {
  return (TABS as readonly string[]).includes(value)
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
