import { createAsyncThunk } from '@reduxjs/toolkit'

import { LOCAL_DATA_MODE } from '@/shared/lib/local-storage/config'

import { transactionRepository } from '../../local/repository'
import { transactionApi } from '../api'
import type { TransactionDto } from '../types'

export type SetCurrentState = {
  transaction: {
    transactions: TransactionDto[]
  }
}

export const setCurrent = createAsyncThunk<
  TransactionDto,
  string,
  { state: SetCurrentState }
>('transaction/setCurrent', async (id: string, { getState }) => {
  if (LOCAL_DATA_MODE === 'dexie') {
    const local = await transactionRepository.getById(id)
    if (local) return local
  }

  const transaction = getState().transaction.transactions.find(
    (t) => t.id === id
  )
  if (transaction) return transaction

  return transactionApi.getById(id)
})
