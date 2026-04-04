import { createAsyncThunk } from '@reduxjs/toolkit'

import { transferApi } from '@/features/transfer'
import { selectTimeRangeFormatted } from '@/store/slices/time-range'
import type { RootState } from '@/store'

export const fetchTransfers = createAsyncThunk(
  'transfer/fetchTransfers',
  (_, { getState }) => {
    const rootState = getState() as RootState
    const range = selectTimeRangeFormatted(rootState)

    return transferApi.list({
      createdFrom: range?.from,
      createdTo: range?.to,
    })
  }
)
