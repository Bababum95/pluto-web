import { createAsyncThunk } from '@reduxjs/toolkit'

import { transactionApi } from '@/features/transaction'
import type { RootState } from '@/store'

type FetchTransactionsPayload = {
  clear?: boolean
}

export const fetchTransactions = createAsyncThunk(
  'transaction/fetchTransactions',
  (_payload: FetchTransactionsPayload | undefined, { getState }) => {
    const rootState = getState() as RootState
    const { range } = rootState.timeRange

    return transactionApi.list({
      type: rootState.transactionType.transactionType,
      from: range.from,
      to: range.to,
    })
  }
)
