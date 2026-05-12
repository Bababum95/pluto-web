import { createAsyncThunk } from '@reduxjs/toolkit'

import dayjs from '@/lib/dayjs'
import { transactionApi } from '@/features/transaction'
import { isDateWithinBounds } from '@/features/time-range'
import { parseDecimal } from '@/features/money'
import { updateAccountInState, setSummary } from '@/entities/account'
import type { TransactionFormType } from '@/features/transaction/types'
import type { RootState } from '@/store'

export const createTransaction = createAsyncThunk(
  'transaction/createTransaction',
  async (data: TransactionFormType, { getState, dispatch }) => {
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

    // Update account balance in account entity
    if (response.account) {
      dispatch(updateAccountInState(response.account))
    }
    if (response.summary) {
      dispatch(setSummary(response.summary))
    }

    return {
      ...response,
      insert: isDateWithinBounds(date, range),
    }
  }
)
