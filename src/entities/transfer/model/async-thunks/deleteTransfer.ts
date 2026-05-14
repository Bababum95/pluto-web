import { createAsyncThunk } from '@reduxjs/toolkit'

import { LOCAL_DATA_MODE } from '@/shared/lib/local-storage/config'
import { transferApi } from '../api'

import { transferRepository, enqueueDeleteTransfer } from '../../local'

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
