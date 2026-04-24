import { createAsyncThunk } from '@reduxjs/toolkit'

import { transferApi } from '@/features/transfer'
import { selectTimeRangeFormatted } from '@/store/slices/time-range'
import type { RootState } from '@/store'

let abortController: AbortController | null = null

export const fetchTransfers = createAsyncThunk(
  'transfer/fetchTransfers',
  (_, { getState }) => {
    abortController?.abort()
    abortController = new AbortController()

    const rootState = getState() as RootState
    const range = selectTimeRangeFormatted(rootState)

    return transferApi.list(
      { createdFrom: range?.from, createdTo: range?.to },
      { signal: abortController.signal }
    )
  }
)
