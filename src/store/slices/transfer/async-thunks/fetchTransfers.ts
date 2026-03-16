import { createAsyncThunk } from '@reduxjs/toolkit'

import { transferApi } from '@/features/transfer'
import { getTimeRangeBounds } from '@/features/time-range'
import type { RootState } from '@/store'

export const fetchTransfers = createAsyncThunk(
  'transfer/fetchTransfers',
  (_, { getState }) => {
    const rootState = getState() as RootState
    const { timeRange, timeRangeIndex } = rootState.timeRange
    const bounds = getTimeRangeBounds(timeRange, timeRangeIndex)

    return transferApi.list({
      createdFrom: bounds.from,
      createdTo: bounds.to,
    })
  }
)
