import { configureStore } from '@reduxjs/toolkit'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import timeRangeReducer from '@/app/store/slices/time-range'
import transactionTypeReducer from '@/app/store/slices/transaction-type'
import accountReducer from '@/entities/account/model/account.slice'
import exchangeRateReducer from '@/entities/exchange-rate/model/exchange-rate.slice'
import settingsReducer from '@/entities/settings/model/settings.slice'
import { mockAccount, mockAccountSummary } from '@/testing/data/account'
import { mockCategory } from '@/testing/data/category'
import { mockSettings } from '@/testing/data/settings'
import { mockTag } from '@/testing/data/tag'

vi.mock('@/app/store', () => ({
  createStore: vi.fn(() => ({
    getState: vi.fn(() => ({})),
    dispatch: vi.fn(),
  })),
}))

vi.mock('@/shared/lib/local-storage/config', () => ({
  LOCAL_DATA_MODE: 'dexie' as const,
  getLocalDataMode: (): 'dexie' | 'api-only' => 'dexie',
}))

vi.mock('@/shared/lib/local-storage/temp-id', () => ({
  generateTempEntityId: () => 'temp-txn-1',
}))

vi.mock('../../api')
vi.mock('../../apply-transaction-mutation-side-effects', () => ({
  applyTransactionMutationSideEffects: vi.fn(),
}))
vi.mock('../../../local/repository')
vi.mock('../../../local/outbox-helpers')
vi.mock('@/entities/account/local/repository')
vi.mock('@/entities/category')
vi.mock('@/entities/tag')

import { createTransaction } from '../createTransaction'
import { transactionApi } from '../../api'
import { applyTransactionMutationSideEffects } from '../../apply-transaction-mutation-side-effects'
import { transactionRepository } from '../../../local/repository'
import { enqueueCreateTransaction } from '../../../local/outbox-helpers'
import { accountRepository } from '@/entities/account/local/repository'
import { categoryRepository } from '@/entities/category'
import { tagRepository } from '@/entities/tag'
import type { TransactionFormType } from '../../types'
import type { AppDispatch } from '@/app/store/store'

function createDexieTestStore() {
  return configureStore({
    reducer: {
      timeRange: timeRangeReducer,
      transactionType: transactionTypeReducer,
      account: accountReducer,
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
      account: {
        accounts: [mockAccount],
        summary: mockAccountSummary,
        status: 'success' as const,
      },
      exchangeRate: {
        rates: [
          {
            id: 'rate-usd',
            code: 'USD',
            value: 1,
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
        ],
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
    tags: [mockTag.id],
  }

  beforeEach(() => {
    const store = createDexieTestStore()
    dispatch = store.dispatch as AppDispatch
    vi.clearAllMocks()

    vi.mocked(accountRepository.getById).mockResolvedValue(mockAccount)
    vi.mocked(accountRepository.getAll).mockResolvedValue([mockAccount])
    vi.mocked(accountRepository.save).mockResolvedValue()
    vi.mocked(categoryRepository.getById).mockResolvedValue(mockCategory)
    vi.mocked(tagRepository.getById).mockResolvedValue(mockTag)
    vi.mocked(transactionRepository.save).mockResolvedValue()
    vi.mocked(enqueueCreateTransaction).mockResolvedValue()
  })

  it('persists transaction, updates account balance locally, and applies side effects', async () => {
    const result = await dispatch(createTransaction(formData))

    expect(createTransaction.fulfilled.match(result)).toBe(true)
    expect(transactionApi.create).not.toHaveBeenCalled()
    expect(transactionRepository.save).toHaveBeenCalled()
    expect(enqueueCreateTransaction).toHaveBeenCalledWith(
      'temp-txn-1',
      expect.objectContaining({
        amount: 50,
        scale: 0,
        type: 'expense',
      })
    )
    expect(accountRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: mockAccount.id,
        balance: expect.objectContaining({
          original: expect.objectContaining({ raw: 99950 }),
        }),
      })
    )
    expect(applyTransactionMutationSideEffects).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        accounts: [
          expect.objectContaining({
            id: mockAccount.id,
            balance: expect.objectContaining({
              original: expect.objectContaining({ raw: 99950 }),
            }),
          }),
        ],
        summary: expect.objectContaining({
          total_raw: expect.any(Number),
          total: expect.any(Number),
        }),
      })
    )
  })
})
