import { describe, it, expect, vi } from 'vitest'

vi.mock('@/store', () => ({
  createStore: vi.fn(() => ({ getState: vi.fn(() => ({})) })),
}))

import exchangeRateReducer, { fetchExchangeRates } from './index'
import {
  selectExchangeRates,
  selectExchangeRatesStatus,
} from './selectors'
import type { RootState } from '@/store'
import {
  mockExchangeRate,
  createMockExchangeRate,
} from '@/testing/data/exchange-rate'

describe('exchangeRate slice', () => {
  describe('fetchExchangeRates', () => {
    it('pending sets status to pending', () => {
      const state = exchangeRateReducer(
        undefined,
        fetchExchangeRates.pending('req-1', undefined)
      )
      expect(state.status).toBe('pending')
    })

    it('fulfilled sets rates and status success', () => {
      const rates = [
        mockExchangeRate,
        createMockExchangeRate({ id: 'rate-2', code: 'EUR' }),
      ]
      const action = fetchExchangeRates.fulfilled(rates, 'req-1', undefined)
      const state = exchangeRateReducer(undefined, action)
      expect(state.status).toBe('success')
      expect(state.rates).toEqual(rates)
    })

    it('rejected sets status to failed', () => {
      const state = exchangeRateReducer(
        undefined,
        fetchExchangeRates.rejected(new Error('fail'), 'req-1', undefined)
      )
      expect(state.status).toBe('failed')
    })
  })
})

describe('exchangeRate selectors', () => {
  function state(s: RootState['exchangeRate']): RootState {
    return { exchangeRate: s } as RootState
  }

  it('selectExchangeRates returns rates', () => {
    const s = state({
      rates: [mockExchangeRate],
      status: 'success',
    })
    expect(selectExchangeRates(s)).toEqual([mockExchangeRate])
  })

  it('selectExchangeRatesStatus returns status', () => {
    expect(
      selectExchangeRatesStatus(state({ rates: [], status: 'pending' }))
    ).toBe('pending')
  })
})
