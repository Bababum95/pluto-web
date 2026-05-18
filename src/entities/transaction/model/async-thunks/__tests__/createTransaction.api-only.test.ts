import { configureStore } from '@reduxjs/toolkit'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import timeRangeReducer from '@/app/store/slices/time-range'
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

vi.mock('../../apply-transaction-mutation-side-effects', () => ({
  applyTransactionMutationSideEffects: vi.fn(),
}))

vi.mock('../../api')

import { createTransaction } from '../createTransaction'
import { transactionApi } from '../../api'
import { applyTransactionMutationSideEffects } from '../../apply-transaction-mutation-side-effects'
import type { TransactionFormType } from '../../types'
import type { AppDispatch } from '@/app/store/store'

function createTransactionTestStore() {
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

type TransactionTestStore = ReturnType<typeof createTransactionTestStore>

describe('createTransaction (api-only mode)', () => {
  let store: TransactionTestStore
  let dispatch: AppDispatch

  const formData: TransactionFormType = {
    amount: '100',
    account: mockAccount.id,
    category: mockCategory.id,
    date: new Date('2024-01-15'),
    comment: 'Test note',
    tags: ['tag-1'],
  }

  beforeEach(() => {
    store = createTransactionTestStore()
    dispatch = store.dispatch as AppDispatch
    vi.clearAllMocks()
  })

  it('creates transaction via API', async () => {
    const transaction = createMockTransaction()
    const apiResponse = {
      transaction,
      accounts: [mockAccount],
      summary: mockAccountSummary,
    }

    vi.mocked(transactionApi.create).mockResolvedValue(apiResponse)

    const result = await dispatch(createTransaction(formData))

    expect(createTransaction.fulfilled.match(result)).toBe(true)
    if (createTransaction.fulfilled.match(result)) {
      expect(transactionApi.create).toHaveBeenCalledWith(
        expect.objectContaining({
          account: mockAccount.id,
          category: mockCategory.id,
          type: 'expense',
          date: '2024-01-15',
          amount: 100,
          scale: 0,
          comment: 'Test note',
          tags: ['tag-1'],
        })
      )
      expect(result.payload.transaction).toEqual(transaction)
      expect(result.payload.insert).toBe(true)
      expect(applyTransactionMutationSideEffects).toHaveBeenCalledWith(
        expect.any(Function),
        apiResponse
      )
    }
  })

  it('handles API errors', async () => {
    vi.mocked(transactionApi.create).mockRejectedValue(new Error('API error'))

    const result = await dispatch(createTransaction(formData))

    expect(createTransaction.rejected.match(result)).toBe(true)
  })

  it('creates transaction with optional fields', async () => {
    const transaction = createMockTransaction({ comment: 'Test note' })
    const apiResponse = {
      transaction,
      accounts: [mockAccount],
      summary: mockAccountSummary,
    }

    vi.mocked(transactionApi.create).mockResolvedValue(apiResponse)

    const result = await dispatch(createTransaction(formData))

    expect(createTransaction.fulfilled.match(result)).toBe(true)
    if (createTransaction.fulfilled.match(result)) {
      expect(transactionApi.create).toHaveBeenCalledWith(
        expect.objectContaining({
          comment: 'Test note',
          tags: ['tag-1'],
        })
      )
    }
  })
})
