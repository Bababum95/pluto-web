import { createAsyncThunk } from '@reduxjs/toolkit'

import { LOCAL_DATA_MODE } from '@/shared/lib/local-storage/config'
import type { RootState } from '@/app/store'

import { transactionRepository } from '../../local'
import { transactionApi } from '../api'
import { selectTransactionById } from '../selectors'
import type { TransactionDto } from '../types'

export const setCurrent = createAsyncThunk<
  TransactionDto,
  string,
  { state: RootState }
>('transaction/setCurrent', async (id: string, { getState }) => {
  if (LOCAL_DATA_MODE === 'dexie') {
    const transaction = await transactionRepository.getById(id)

    if (transaction) return transaction
  }

  const state = getState()
  const transaction = selectTransactionById(id)(state)

  if (transaction) return transaction

  return transactionApi.getById(id)
})
