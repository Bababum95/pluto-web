import { createAsyncThunk } from '@reduxjs/toolkit'

import dayjs from '@/lib/dayjs'
import { transactionApi } from '@/features/transaction'
import { isDateWithinBounds } from '@/features/time-range'
import { parseDecimal } from '@/features/money'
import type { TransactionFormType } from '@/features/transaction/types'
import type { RootState } from '@/store'

export const createTransaction = createAsyncThunk(
  'transaction/createTransaction',
  async (data: TransactionFormType, { getState }) => {
    const rootState = getState() as RootState
    const { range } = rootState.timeRange
    const { balance, scale } = parseDecimal(data.amount)
    const date = dayjs(data.date).format('YYYY-MM-DD')

    const response = await transactionApi.create({
      ...data,
      scale,
      date,
      amount: balance,
      type: rootState.transactionType.transactionType,
    })

    return {
      ...response,
      insert: isDateWithinBounds(date, range),
    }
  }
)
