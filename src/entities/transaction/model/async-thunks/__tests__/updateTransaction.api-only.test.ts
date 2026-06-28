import { configureStore } from '@reduxjs/toolkit'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import transactionTypeReducer from '@/app/store/slices/transaction-type'
import { createMockTransaction } from '@/testing/data/transaction'
import { mockAccount, mockAccountSummary } from '@/testing/data/account'
import { mockCategory } from '@/testing/data/category'

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

import { accountsPatched } from '@/entities/account'
import { updateTransaction } from '../updateTransaction'
import { transactionApi } from '../../api'
import type { TransactionFormType } from '../../types'
import type { AppDispatch } from '@/app/store/store'

vi.mock('@/shared/lib/local-storage/config', () => ({
  LOCAL_DATA_MODE: 'api-only' as const,
  getLocalDataMode: (): 'dexie' | 'api-only' => 'api-only',
}))

function createTestStore() {
  return configureStore({
    reducer: {
      transactionType: transactionTypeReducer,
    },
    preloadedState: {
      transactionType: { transactionType: 'expense' as const },
    },
  })
}

describe('updateTransaction (api-only mode)', () => {
  let dispatch: AppDispatch

  const formData: TransactionFormType = {
    amount: '100',
    account: mockAccount.id,
    category: mockCategory.id,
    date: new Date('2024-02-01'),
    comment: 'Updated',
    tags: [],
  }

  beforeEach(() => {
    const store = createTestStore()
    dispatch = store.dispatch as AppDispatch
    vi.clearAllMocks()
  })

  it('updates transaction via api and patches accounts when response includes balances', async () => {
    const transaction = createMockTransaction({ id: 'tx-1' })
    const apiResponse = {
      transaction,
      accounts: [mockAccount],
      summary: mockAccountSummary,
    }

    vi.mocked(transactionApi.update).mockResolvedValue(apiResponse)

    const result = await dispatch(
      updateTransaction({ id: 'tx-1', recalcBalance: true, data: formData })
    )

    expect(updateTransaction.fulfilled.match(result)).toBe(true)
    expect(transactionApi.update).toHaveBeenCalledWith(
      'tx-1',
      expect.objectContaining({
        amount: 100,
        scale: 0,
        type: 'expense',
      }),
      { recalcBalance: 'true' }
    )
    expect(accountsPatched).toHaveBeenCalledWith({
      accounts: apiResponse.accounts,
      summary: apiResponse.summary,
    })
  })
})
