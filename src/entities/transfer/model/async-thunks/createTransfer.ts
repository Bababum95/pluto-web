import { createAsyncThunk } from '@reduxjs/toolkit'

import { LOCAL_DATA_MODE } from '@/shared/lib/local-storage/config'
import { generateTempEntityId } from '@/shared/lib/local-storage/temp-id'
import { transferApi } from '../api'
import type { CreateTransferDto, TransferDto } from '../dto-types'

import { transferRepository, enqueueCreateTransfer } from '../../local'

export const createTransfer = createAsyncThunk(
  'transfer/createTransfer',
  async (data: CreateTransferDto) => {
    if (LOCAL_DATA_MODE === 'dexie') {
      const tempId = generateTempEntityId()
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
