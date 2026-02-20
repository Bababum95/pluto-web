import { createAsyncThunk } from '@reduxjs/toolkit'

import { transactionApi } from '@/features/transaction'
import { getTimeRangeBounds } from '@/features/time-range'
import type { RootState } from '@/store'

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
