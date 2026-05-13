import { createAsyncThunk } from '@reduxjs/toolkit'

import { LOCAL_DATA_MODE } from '@/lib/local/config'
import { transferApi } from '@/features/transfer'
import type { TransferDto } from '@/features/transfer/types'
import {
  transferRepository,
  enqueueCreateTransfer,
} from '@/entities/transfer/local'
import type { CreateTransferDto } from '@/features/transfer/types'

export const createTransfer = createAsyncThunk(
  'transfer/createTransfer',
  async (data: CreateTransferDto) => {
    if (LOCAL_DATA_MODE === 'dexie') {
      const tempId = `temp-${Date.now()}`
      const now = new Date().toISOString()
      const fee = data.fee ?? { value: 0, scale: 0 }

      const transfer: TransferDto = {
        id: tempId,
        from: data.from,
        to: data.to,
        rate: data.rate,
        fee,
        createdAt: now,
        updatedAt: now,
      }

      await transferRepository.save(transfer)
      await enqueueCreateTransfer(tempId, data)

      return transfer
    }

    return transferApi.create(data)
  }
)
