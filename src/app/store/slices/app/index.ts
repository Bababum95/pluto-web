import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

import { fetchCategories } from '@/entities/category'
import { fetchTags } from '@/entities/tag'
import { fetchAccounts } from '@/entities/account'
import { fetchSettings } from '@/entities/settings'
import { fetchTransactions } from '@/entities/transaction'
import { fetchExchangeRates } from '@/entities/exchange-rate'
import { fetchTransfers } from '@/entities/transfer'
import type { RootState } from '../../store'
import type { Status } from '@/lib/types'

type AppState = {
  status: Status
}

const initialState: AppState = {
  status: 'idle',
}

export const initApp = createAsyncThunk('app/init', async (_, { dispatch }) => {
  Promise.all([dispatch(fetchExchangeRates()), dispatch(fetchTransfers())])

  await Promise.all([
    dispatch(fetchCategories()),
    dispatch(fetchTags()),
    dispatch(fetchAccounts()),
    dispatch(fetchSettings()),
    dispatch(fetchTransactions()),
  ])
})

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(initApp.pending, (state) => {
        state.status = 'pending'
      })
      .addCase(initApp.fulfilled, (state) => {
        state.status = 'success'
      })
      .addCase(initApp.rejected, (state) => {
        state.status = 'failed'
      })
  },
})

export const selectAppInitStatus = (state: RootState) => state.app.status

export default appSlice.reducer
