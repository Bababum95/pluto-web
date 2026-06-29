import { configureStore } from '@reduxjs/toolkit'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import transactionTypeReducer from '@/app/store/slices/transaction-type'
import { createMockTransaction } from '@/testing/data/transaction'
import { mockAccount } from '@/testing/data/account'
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
vi.mock('../../../local/operations')

import { accountsPatched } from '@/entities/account'
import { updateTransaction } from '../updateTransaction'
import { transactionApi } from '../../api'
import { transactionLocalApi } from '../../../local/operations'
import type { TransactionFormType } from '../../types'
import type { AppDispatch } from '@/app/store/store'

vi.mock('@/shared/lib/local-storage/config', () => ({
  LOCAL_DATA_MODE: 'dexie' as const,
  getLocalDataMode: (): 'dexie' | 'api-only' => 'dexie',
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

describe('updateTransaction (dexie mode)', () => {
  let dispatch: AppDispatch

  const formData: TransactionFormType = {
    amount: '75',
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

  it('updates transaction via transactionLocalApi without calling api', async () => {
    const updated = createMockTransaction({ id: 'tx-1', comment: 'Updated' })
    vi.mocked(transactionLocalApi.update).mockResolvedValue({
      transaction: updated,
    })

    const result = await dispatch(
      updateTransaction({ id: 'tx-1', data: formData })
    )

    expect(updateTransaction.fulfilled.match(result)).toBe(true)
    expect(transactionApi.update).not.toHaveBeenCalled()
    expect(transactionLocalApi.update).toHaveBeenCalledWith({
      id: 'tx-1',
      data: expect.objectContaining({
        amount: 75,
        scale: 0,
        type: 'expense',
        date: '2024-02-01',
      }),
      params: { recalcBalance: 'false' },
    })
    expect(accountsPatched).not.toHaveBeenCalled()
  })
})
