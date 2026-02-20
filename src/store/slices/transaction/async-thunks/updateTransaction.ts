import { createAsyncThunk } from '@reduxjs/toolkit'

import { transactionApi } from '@/features/transaction'
import type { UpdateTransactionDto } from '@/features/transaction/types'

export const updateTransaction = createAsyncThunk(
  'transaction/updateTransaction',
  ({ id, data }: { id: string; data: UpdateTransactionDto }) =>
    transactionApi.update(id, data)
)
