import { createAsyncThunk } from '@reduxjs/toolkit'

import { transferApi } from '@/features/transfer'

export const deleteTransfer = createAsyncThunk(
  'transfer/deleteTransfer',
  (id: string) => transferApi.delete(id)
)
