import { configureStore } from '@reduxjs/toolkit'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import timeRangeReducer from '@/app/store/slices/time-range'
import transactionTypeReducer from '@/app/store/slices/transaction-type'
import exchangeRateReducer from '@/entities/exchange-rate/model/exchange-rate.slice'
import settingsReducer from '@/entities/settings/model/settings.slice'
import { createMockTransaction } from '@/testing/data/transaction'
import { mockAccount, mockAccountSummary } from '@/testing/data/account'
import { mockCategory } from '@/testing/data/category'
import { mockSettings } from '@/testing/data/settings'

vi.mock('@/app/store', () => ({
  createStore: vi.fn(() => ({
    getState: vi.fn(() => ({})),
    dispatch: vi.fn(),
  })),
}))

vi.mock('@/entities/account', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/entities/account')>()
  return {
    ...actual,
    accountsPatched: vi.fn(actual.accountsPatched),
  }
})

vi.mock('../../api')
vi.mock('../../../local/operations')

vi.mock('@/entities/exchange-rate/local/repository', () => ({
  exchangeRateRepository: {
    getAll: vi.fn(),
  },
}))

import { accountsPatched } from '@/entities/account'
import { exchangeRateRepository } from '@/entities/exchange-rate/local/repository'
import { createTransaction } from '../createTransaction'
import { transactionApi } from '../../api'
import { transactionLocalApi } from '../../../local/operations'
import type { TransactionFormType } from '../../types'
import type { AppDispatch } from '@/app/store/store'

vi.mock('@/shared/lib/local-storage/config', () => ({
  LOCAL_DATA_MODE: 'dexie' as const,
  getLocalDataMode: (): 'dexie' | 'api-only' => 'dexie',
}))

const usdRate = {
  id: 'rate-usd',
  code: 'USD',
  value: 1,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

function createDexieTestStore(rates = [usdRate]) {
  return configureStore({
    reducer: {
      timeRange: timeRangeReducer,
      transactionType: transactionTypeReducer,
      exchangeRate: exchangeRateReducer,
      settings: settingsReducer,
    },
    preloadedState: {
      timeRange: {
        type: 'period' as const,
        index: 0,
        range: { from: '2024-01-01', to: '2024-12-31' },
      },
      transactionType: { transactionType: 'expense' as const },
      exchangeRate: {
        rates,
        status: 'success' as const,
      },
      settings: {
        settings: mockSettings,
        status: 'success' as const,
      },
    },
  })
}

describe('createTransaction (dexie mode)', () => {
  let dispatch: AppDispatch

  const formData: TransactionFormType = {
    amount: '50',
    account: mockAccount.id,
    category: mockCategory.id,
    date: new Date('2024-01-15'),
    comment: 'Coffee',
    tags: ['tag-1'],
  }

  beforeEach(() => {
    const store = createDexieTestStore()
    dispatch = store.dispatch as AppDispatch
    vi.clearAllMocks()
  })

  it('creates transaction locally and applies account side effects', async () => {
    const transaction = createMockTransaction({ id: 'temp-txn-1' })
    const updatedAccount = {
      ...mockAccount,
      balance: {
        ...mockAccount.balance,
        original: {
          ...mockAccount.balance.original,
          raw: 99950,
        },
      },
    }

    vi.mocked(transactionLocalApi.create).mockResolvedValue({
      transaction,
      accounts: [updatedAccount],
      summary: mockAccountSummary,
    })

    const result = await dispatch(createTransaction(formData))

    expect(createTransaction.fulfilled.match(result)).toBe(true)
    expect(transactionApi.create).not.toHaveBeenCalled()
    expect(transactionLocalApi.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          amount: 50,
          scale: 0,
          type: 'expense',
          date: '2024-01-15',
        }),
      })
    )
    expect(accountsPatched).toHaveBeenCalledWith({
      accounts: [updatedAccount],
      summary: mockAccountSummary,
    })
  })

  it('loads rates from IndexedDB when Redux exchange rates are empty', async () => {
    const store = createDexieTestStore([])
    dispatch = store.dispatch as AppDispatch

    const localRates = [
      {
        ...usdRate,
        id: 'rate-eur',
        code: 'EUR',
        value: 0.8,
      },
    ]
    vi.mocked(exchangeRateRepository.getAll).mockResolvedValue(localRates)
    vi.mocked(transactionLocalApi.create).mockResolvedValue({
      transaction: createMockTransaction({ id: 'temp-txn-2' }),
      accounts: [mockAccount],
      summary: mockAccountSummary,
    })

    await dispatch(createTransaction(formData))

    expect(exchangeRateRepository.getAll).toHaveBeenCalled()
    expect(transactionLocalApi.create).toHaveBeenCalledWith(
      expect.objectContaining({
        rates: localRates,
      })
    )
  })
})
