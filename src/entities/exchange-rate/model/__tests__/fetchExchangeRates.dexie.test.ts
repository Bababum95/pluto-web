import { describe, it, expect, vi, beforeEach } from 'vitest'

import { fetchExchangeRates } from '../exchange-rate.slice'
import { exchangeRateApi } from '../api'
import { exchangeRateRepository } from '../../local/repository'
import { syncCoordinator } from '@/shared/lib/local-storage/sync-coordinator'
import { mockExchangeRate } from '@/testing/data/exchange-rate'

vi.mock('@/shared/lib/local-storage/config', () => ({
  LOCAL_DATA_MODE: 'dexie' as const,
  getLocalDataMode: (): 'dexie' | 'api-only' => 'dexie',
}))

vi.mock('../api')
vi.mock('../../local/repository')
vi.mock('@/shared/lib/local-storage/sync-coordinator', () => ({
  syncCoordinator: {
    syncNow: vi.fn().mockResolvedValue(undefined),
  },
}))

describe('fetchExchangeRates (dexie mode)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads rates from local storage and triggers background sync', async () => {
    vi.mocked(exchangeRateRepository.getAll).mockResolvedValue([
      mockExchangeRate,
    ])

    const result = await fetchExchangeRates()(vi.fn(), vi.fn(), undefined)

    expect(exchangeRateRepository.getAll).toHaveBeenCalled()
    expect(syncCoordinator.syncNow).toHaveBeenCalled()
    expect(exchangeRateApi.list).not.toHaveBeenCalled()
    expect(result.type).toBe('exchangeRate/fetchAll/fulfilled')
    expect(result.payload).toEqual([mockExchangeRate])
  })
})
