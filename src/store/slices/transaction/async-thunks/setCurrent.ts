import { createAsyncThunk } from '@reduxjs/toolkit'

import { transactionApi } from '@/features/transaction'
import type { RootState } from '@/store'

import { selectTransactionById } from '../selectors'

export const setCurrent = createAsyncThunk(
  'transaction/setCurrent',
  async (id: string, { getState }) => {
    const state = getState() as RootState
    const transaction = selectTransactionById(id)(state)
    if (transaction) return transaction
    return transactionApi.getById(id)
  }
)
