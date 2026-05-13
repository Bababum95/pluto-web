import { createAsyncThunk } from '@reduxjs/toolkit'

import { LOCAL_DATA_MODE } from '@/lib/local/config'
import { transactionApi } from '@/features/transaction'

import {
  transactionRepository,
  enqueueDeleteTransaction,
} from '../../local'

export const deleteTransaction = createAsyncThunk(
  'transaction/deleteTransaction',
  async (id: string) => {
    if (LOCAL_DATA_MODE === 'dexie') {
      await transactionRepository.delete(id)
      await enqueueDeleteTransaction(id)
      return
    }

    await transactionApi.delete(id)
  }
)
