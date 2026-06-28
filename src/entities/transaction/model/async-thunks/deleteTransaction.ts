import { createAsyncThunk } from '@reduxjs/toolkit'

import { LOCAL_DATA_MODE } from '@/shared/lib/local-storage/config'
import type { RootState } from '@/app/store'

import { transactionLocalApi } from '../../local'
import { transactionApi } from '../api'

export const deleteTransaction = createAsyncThunk<
  void,
  string,
  { state: RootState }
>('transaction/deleteTransaction', async (id: string) => {
  if (LOCAL_DATA_MODE === 'dexie') {
    await transactionLocalApi.delete(id)
    return
  }

  await transactionApi.delete(id)
})
