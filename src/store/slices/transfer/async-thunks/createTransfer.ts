import { createAsyncThunk } from '@reduxjs/toolkit'

import { transferApi } from '@/features/transfer'
import type { CreateTransferDto } from '@/features/transfer/types'

export const createTransfer = createAsyncThunk(
  'transfer/createTransfer',
  (data: CreateTransferDto) => transferApi.create(data)
)
