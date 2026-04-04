import { describe, it, expect } from 'vitest'
import { waitFor } from '@testing-library/react'

import { createStore } from '@/store'
import {
  setTimeRange,
  setTimeRangeIndex,
  increaseTimeRangeIndex,
  decreaseTimeRangeIndex,
} from '@/store/slices/time-range'
import { setTransactionType } from '@/store/slices/transaction-type'
import { mockTransaction } from '@/testing/data/transaction'
import { mockTransfer } from '@/testing/data/transfer'
import { getTimeRangeBounds } from '@/features/time-range'

async function waitForTransactionsAndTransfersRefetch(store: ReturnType<
  typeof createStore
>): Promise<void> {
  await waitFor(
    () => {
      const { transaction, transfer } = store.getState()
      expect(transaction.status).toBe('success')
      expect(transfer.status).toBe('success')
    },
    { timeout: 3000 }
  )
}

describe('Middlewares (integration)', () => {
  it('setTimeRange triggers fetchTransactions and fetchTransfers', async () => {
    const store = createStore()

    store.dispatch(setTimeRange({ type: 'week' }))

    await waitForTransactionsAndTransfersRefetch(store)

    expect(store.getState().transaction.transactions).toHaveLength(1)
    expect(store.getState().transaction.transactions[0].id).toBe(
      mockTransaction.id
    )
    expect(store.getState().transfer.transfers).toHaveLength(1)
    expect(store.getState().transfer.transfers[0].id).toBe(mockTransfer.id)
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

  it('increaseTimeRangeIndex triggers fetchTransactions and fetchTransfers', async () => {
    const store = createStore()

    store.dispatch(increaseTimeRangeIndex())

    await waitForTransactionsAndTransfersRefetch(store)

    expect(store.getState().transaction.transactions).toHaveLength(1)
    expect(store.getState().transfer.transfers).toHaveLength(1)
    expect(store.getState().transfer.transfers[0].id).toBe(mockTransfer.id)
  })

  it('setTimeRangeIndex triggers fetchTransactions and fetchTransfers', async () => {
    const store = createStore()

    store.dispatch(setTimeRangeIndex(2))

    await waitForTransactionsAndTransfersRefetch(store)

    expect(store.getState().transaction.transactions).toHaveLength(1)
    expect(store.getState().transfer.transfers).toHaveLength(1)
    expect(store.getState().transfer.transfers[0].id).toBe(mockTransfer.id)
  })

  it('decreaseTimeRangeIndex triggers fetchTransactions and fetchTransfers', async () => {
    const store = createStore({
      timeRange: {
        type: 'day',
        index: 2,
        range: getTimeRangeBounds('day', 2),
      },
    })

    store.dispatch(decreaseTimeRangeIndex())

    await waitForTransactionsAndTransfersRefetch(store)

    expect(store.getState().transaction.transactions).toHaveLength(1)
    expect(store.getState().transfer.transfers).toHaveLength(1)
    expect(store.getState().transfer.transfers[0].id).toBe(mockTransfer.id)
  })
})
