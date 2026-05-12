import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

import { LOCAL_DATA_MODE } from '@/lib/local/config'
import { syncCoordinator } from '@/lib/local/sync-coordinator'
import { exchangeRateRepository } from '@/entities/exchange-rate/local'
import type { Status } from '@/lib/types'

import { exchangeRateApi } from './api'
import type { RateDto } from './types'

type ExchangeRateState = {
  rates: RateDto[]
  status: Status
}

const initialState: ExchangeRateState = {
  rates: [],
  status: 'idle',
}

export const fetchExchangeRates = createAsyncThunk(
  'exchangeRate/fetchAll',
  async () => {
    if (LOCAL_DATA_MODE === 'dexie') {
      // Load from local first
      const rates = await exchangeRateRepository.getAll()

      // Trigger background sync (non-blocking)
      syncCoordinator.syncNow().catch(console.error)

      return rates
    }

    return exchangeRateApi.list()
  }
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
