import type { RootState } from '@/app/store'

export const selectExchangeRates = (state: RootState) =>
  state.exchangeRate.rates

export const selectExchangeRatesStatus = (state: RootState) =>
  state.exchangeRate.status
