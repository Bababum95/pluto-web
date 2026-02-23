import { createAsyncThunk } from '@reduxjs/toolkit'

import { transferApi } from '@/features/transfer'

export const fetchTransfers = createAsyncThunk(
  'transfer/fetchTransfers',
  () => transferApi.list()
)
