import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

import { exchangeRateApi } from '@/features/exchange-rate/api'
import type { ExchangeRate } from '@/features/exchange-rate/types'
import type { Status } from '@/lib/types'

type ExchangeRateState = {
  rates: ExchangeRate[]
  status: Status
}

const initialState: ExchangeRateState = {
  rates: [],
  status: 'idle',
}

export const fetchExchangeRates = createAsyncThunk(
  'exchangeRate/fetchAll',
  () => exchangeRateApi.list()
)

export const exchangeRateSlice = createSlice({
  name: 'exchangeRate',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchExchangeRates.pending, (state) => {
        state.status = 'pending'
      })
      .addCase(fetchExchangeRates.fulfilled, (state, action) => {
        state.status = 'success'
        state.rates = action.payload
      })
      .addCase(fetchExchangeRates.rejected, (state) => {
        state.status = 'failed'
      })
  },
})

export * from './selectors'
export default exchangeRateSlice.reducer
