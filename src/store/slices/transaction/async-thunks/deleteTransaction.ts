import { createAsyncThunk } from '@reduxjs/toolkit'

import { transactionApi } from '@/features/transaction'

export const deleteTransaction = createAsyncThunk(
  'transaction/deleteTransaction',
  (id: string) => transactionApi.delete(id)
)
