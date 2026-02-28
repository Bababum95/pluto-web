import { createAsyncThunk } from '@reduxjs/toolkit'

import { transactionApi } from '@/features/transaction'
import { getTimeRangeBounds, isDateWithinBounds } from '@/features/time-range'
import type { CreateTransactionDto } from '@/features/transaction/types'
import type { RootState } from '@/store'

export const createTransaction = createAsyncThunk(
  'transaction/createTransaction',
  async (data: Omit<CreateTransactionDto, 'type'>, { getState }) => {
    const rootState = getState() as RootState
    const { timeRange, timeRangeIndex } = rootState.timeRange
    const bounds = getTimeRangeBounds(timeRange, timeRangeIndex)

    const response = await transactionApi.create({
      ...data,
      type: rootState.transactionType.transactionType,
    })

    return {
      ...response,
      insert: isDateWithinBounds(data.date, bounds),
    }
  }
)
