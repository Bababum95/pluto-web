import { createAsyncThunk } from '@reduxjs/toolkit'

import { LOCAL_DATA_MODE } from '@/lib/local/config'
import { transferApi } from '@/features/transfer'
import {
  transferRepository,
  enqueueDeleteTransfer,
} from '@/entities/transfer/local'

export const deleteTransfer = createAsyncThunk(
  'transfer/deleteTransfer',
  async (id: string) => {
    if (LOCAL_DATA_MODE === 'dexie') {
      await transferRepository.delete(id)
      await enqueueDeleteTransfer(id)
      return
    }

    await transferApi.delete(id)
  }
)
