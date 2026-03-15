import { describe, it, expect } from 'vitest'
import { waitFor } from '@testing-library/react'

import { createStore } from '@/store'
import {
  setTimeRange,
  increaseTimeRangeIndex,
  decreaseTimeRangeIndex,
} from '@/store/slices/time-range'
import { setTransactionType } from '@/store/slices/transaction-type'
import { mockTransaction } from '@/testing/data/transaction'

describe('Middlewares (integration)', () => {
  it('setTimeRange triggers fetchTransactions', async () => {
    const store = createStore()

    store.dispatch(setTimeRange('week'))

    await waitFor(
      () => {
        expect(store.getState().transaction.status).toBe('success')
      },
      { timeout: 3000 }
    )

    expect(store.getState().transaction.transactions).toHaveLength(1)
    expect(store.getState().transaction.transactions[0].id).toBe(
      mockTransaction.id
    )
  })

  it('setTransactionType triggers fetchTransactions with clear', async () => {
    const store = createStore({
      transaction: {
        transactions: [mockTransaction],
        summary: null,
        status: 'success',
        current: null,
      },
    })

    store.dispatch(setTransactionType('income'))

    await waitFor(
      () => {
        expect(store.getState().transaction.status).toBe('success')
      },
      { timeout: 3000 }
    )

    expect(store.getState().transaction.transactions).toHaveLength(1)
    expect(store.getState().transaction.transactions[0].id).toBe(
      mockTransaction.id
    )
  })

  it('increaseTimeRangeIndex triggers fetchTransactions', async () => {
    const store = createStore()

    store.dispatch(increaseTimeRangeIndex())

    await waitFor(
      () => {
        expect(store.getState().transaction.status).toBe('success')
      },
      { timeout: 3000 }
    )

    expect(store.getState().transaction.transactions).toHaveLength(1)
  })

  it('decreaseTimeRangeIndex triggers fetchTransactions', async () => {
    const store = createStore({
      timeRange: {
        timeRange: 'day',
        timeRangeIndex: 2,
      },
    })

    store.dispatch(decreaseTimeRangeIndex())

    await waitFor(
      () => {
        expect(store.getState().transaction.status).toBe('success')
      },
      { timeout: 3000 }
    )

    expect(store.getState().transaction.transactions).toHaveLength(1)
  })
})
