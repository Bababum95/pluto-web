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
import { transactionRepository } from '../../../local/repository'
import type { AppDispatch } from '@/app/store/store'

vi.mock('@/shared/lib/local-storage/config', () => ({
  LOCAL_DATA_MODE: 'dexie' as const,
  getLocalDataMode: (): 'dexie' | 'api-only' => 'dexie',
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
      transactionType: { transactionType: 'expense' as const },
    },
  })
}

describe('fetchTransactions (dexie mode)', () => {
  let dispatch: AppDispatch

  beforeEach(() => {
    const store = createTestStore()
    dispatch = store.dispatch as AppDispatch
    vi.clearAllMocks()
  })

  it('returns local list when dexie has data and triggers background sync', async () => {
    const localList = [createMockTransaction({ id: 'local-1' })]
    vi.mocked(transactionRepository.getByDateRangeAndType).mockResolvedValue(
      localList
    )
    vi.mocked(transactionApi.list).mockResolvedValue(localList)
    vi.mocked(transactionRepository.syncFromApi).mockResolvedValue()

    const result = await dispatch(fetchTransactions({}))

    expect(fetchTransactions.fulfilled.match(result)).toBe(true)
    if (fetchTransactions.fulfilled.match(result)) {
      expect(result.payload).toEqual(localList)
    }
    expect(transactionRepository.getByDateRangeAndType).toHaveBeenCalledWith(
      '2024-01-01',
      '2024-12-31',
      'expense'
    )
  })

  it('falls back to api when local list is empty', async () => {
    const apiList = [createMockTransaction({ id: 'api-1' })]
    vi.mocked(transactionRepository.getByDateRangeAndType).mockResolvedValue([])
    vi.mocked(transactionApi.list).mockResolvedValue(apiList)
    vi.mocked(transactionRepository.syncFromApi).mockResolvedValue()

    const result = await dispatch(fetchTransactions({}))

    expect(fetchTransactions.fulfilled.match(result)).toBe(true)
    if (fetchTransactions.fulfilled.match(result)) {
      expect(result.payload).toEqual(apiList)
    }
    expect(transactionRepository.syncFromApi).toHaveBeenCalledWith(apiList)
  })
})
