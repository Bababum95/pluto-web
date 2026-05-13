import { createAsyncThunk } from '@reduxjs/toolkit'

import { LOCAL_DATA_MODE } from '@/shared/lib/local-storage/config'
import { transactionApi } from '../api'
import type { RootState } from '@/store'

import { transactionRepository } from '../../local'
import { selectTransactionById } from '../selectors'

export const setCurrent = createAsyncThunk(
  'transaction/setCurrent',
  async (id: string, { getState }) => {
    if (LOCAL_DATA_MODE === 'dexie') {
      const local = await transactionRepository.getById(id)
      if (local) return local
    }

    const state = getState() as RootState
    const transaction = selectTransactionById(id)(state)
    if (transaction) return transaction
    return transactionApi.getById(id)
  }
)
