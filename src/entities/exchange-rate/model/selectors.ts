import type { RootState } from '@/store'

export const selectExchangeRates = (state: RootState) =>
  state.exchangeRate.rates

export const selectExchangeRatesStatus = (state: RootState) =>
  state.exchangeRate.status
