import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

import { fetchCategories } from '@/store/slices/category'
import { fetchTags } from '@/store/slices/tag'
import { fetchAccounts } from '@/store/slices/account'
import { fetchSettings } from '@/store/slices/settings'
import { fetchTransactions } from '@/store/slices/transaction'
import { fetchExchangeRates } from '@/store/slices/exchange-rate'
import type { RootState } from '@/store'
import type { Status } from '@/lib/types'

type AppState = {
  status: Status
}

const initialState: AppState = {
  status: 'idle',
}

export const initApp = createAsyncThunk('app/init', async (_, { dispatch }) => {
  Promise.all([dispatch(fetchExchangeRates())])

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
