import { configureStore } from '@reduxjs/toolkit'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import timeRangeReducer from '@/app/store/slices/time-range'
import transactionTypeReducer from '@/app/store/slices/transaction-type'
import { createMockTransaction } from '@/testing/data/transaction'

vi.mock('@/app/store', () => ({
  createStore: vi.fn(() => ({
    getState: vi.fn(() => ({})),
    dispatch: vi.fn(),
  })),
}))

vi.mock('../../api')
vi.mock('../../../local/repository')

import { fetchTransactions } from '../fetchTransactions'
import { transactionApi } from '../../api'
import type { AppDispatch } from '@/app/store/store'

vi.mock('@/shared/lib/local-storage/config', () => ({
  LOCAL_DATA_MODE: 'api-only' as const,
  getLocalDataMode: (): 'dexie' | 'api-only' => 'api-only',
}))

function createTestStore() {
  return configureStore({
    reducer: {
      timeRange: timeRangeReducer,
      transactionType: transactionTypeReducer,
    },
    preloadedState: {
      timeRange: {
        type: 'period' as const,
        index: 0,
        range: { from: '2024-01-01', to: '2024-12-31' },
      },
      transactionType: { transactionType: 'income' as const },
    },
  })
}

describe('fetchTransactions (api-only mode)', () => {
  let dispatch: AppDispatch

  beforeEach(() => {
    const store = createTestStore()
    dispatch = store.dispatch as AppDispatch
    vi.clearAllMocks()
  })

  it('loads transactions from api with time range and type filters', async () => {
    const apiList = [createMockTransaction({ id: 'api-1', type: 'income' })]
    vi.mocked(transactionApi.list).mockResolvedValue(apiList)

    const result = await dispatch(fetchTransactions({ clear: true }))

    expect(fetchTransactions.fulfilled.match(result)).toBe(true)
    expect(transactionApi.list).toHaveBeenCalledWith(
      { type: 'income', from: '2024-01-01', to: '2024-12-31' },
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    )
  })
})
