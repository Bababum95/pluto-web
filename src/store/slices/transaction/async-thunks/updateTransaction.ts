import { createAsyncThunk } from '@reduxjs/toolkit'

import dayjs from '@/lib/dayjs'
import { transactionApi } from '@/features/transaction'
import { parseDecimal } from '@/features/money'
import { updateAccountInState, setSummary } from '@/entities/account'
import type { TransactionFormType } from '@/features/transaction/types'
import type { RootState } from '@/store'

type Params = {
  id: string
  recalcBalance?: boolean
  data: TransactionFormType
}

export const updateTransaction = createAsyncThunk(
  'transaction/updateTransaction',
  async ({ id, recalcBalance, data }: Params, { getState, dispatch }) => {
    const rootState = getState() as RootState
    const { balance, scale } = parseDecimal(data.amount)
    const date = dayjs(data.date).format('YYYY-MM-DD')

    const response = await transactionApi.update(
      id,
      {
        ...data,
        scale,
        date,
        amount: balance,
        type: rootState.transactionType.transactionType,
      },
      { recalcBalance: recalcBalance ? 'true' : 'false' }
    )

    // Update account balance in account entity
    if (response.account) {
      dispatch(updateAccountInState(response.account))
    }
    if (response.summary) {
      dispatch(setSummary(response.summary))
    }

    return response
  }
)
