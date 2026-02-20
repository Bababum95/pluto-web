import { createAsyncThunk } from '@reduxjs/toolkit'

import { transactionApi } from '@/features/transaction'
import type { CreateTransactionDto } from '@/features/transaction/types'
import type { RootState } from '@/store'

export const createTransaction = createAsyncThunk(
  'transaction/createTransaction',
  (data: Omit<CreateTransactionDto, 'type'>, { getState }) => {
    const rootState = getState() as RootState
    return transactionApi.create({
      ...data,
      type: rootState.transactionType.transactionType,
    })
  }
)
