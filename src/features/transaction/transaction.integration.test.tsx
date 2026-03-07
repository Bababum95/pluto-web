import { describe, it, expect } from 'vitest'
import { waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'

import { server } from '@/testing/server'
import { createStore } from '@/store'
import {
  createTransaction,
  deleteTransaction,
} from '@/store/slices/transaction'
import {
  mockTransaction,
  createMockTransaction,
} from '@/testing/data/transaction'
import { mockAccount, mockAccountSummary } from '@/testing/data/account'
import dayjs from '@/lib/dayjs'

describe('Transaction flow (integration)', () => {
  it('createTransaction: API call, store transaction list and summary updated, account updated', async () => {
    const updatedAccount = { ...mockAccount, name: 'Updated Wallet' }
    const updatedSummary = { ...mockAccountSummary, total_raw: 99000 }
    server.use(
      http.post('http://localhost/v1/transactions', () =>
        HttpResponse.json({
          account: updatedAccount,
          summary: updatedSummary,
          transaction: createMockTransaction({ id: 'transaction-new' }),
        })
      )
    )

    const store = createStore({
      account: {
        accounts: [mockAccount],
        summary: mockAccountSummary,
        status: 'success',
      },
    })
    const today = dayjs().format('YYYY-MM-DD')

    store.dispatch(
      createTransaction({
        account: mockAccount.id,
        category: 'category-1',
        amount: '10.00',
        date: dayjs(today).toDate(),
        comment: 'Test',
        tags: [],
      })
    )

    await waitFor(
      () => {
        expect(store.getState().transaction.status).toBe('success')
      },
      { timeout: 3000 }
    )

    const { transaction, account } = store.getState()
    expect(transaction.transactions).toContainEqual(
      expect.objectContaining({ id: 'transaction-new' })
    )
    expect(transaction.summary).not.toBeNull()
    expect(account.accounts).toContainEqual(
      expect.objectContaining({ id: mockAccount.id, name: 'Updated Wallet' })
    )
    expect(account.summary).toEqual(updatedSummary)
  })

  it('createTransaction with date outside time range: transaction not inserted, account still updated', async () => {
    server.use(
      http.post('http://localhost/v1/transactions', () =>
        HttpResponse.json({
          account: mockAccount,
          summary: mockAccountSummary,
          transaction: createMockTransaction({
            id: 'transaction-outside',
            date: '2020-01-01',
          }),
        })
      )
    )

    const store = createStore({
      account: {
        accounts: [mockAccount],
        summary: mockAccountSummary,
        status: 'success',
      },
    })
    const dateOutsideBounds = '2020-01-01'

    store.dispatch(
      createTransaction({
        account: mockAccount.id,
        category: 'category-1',
        amount: '5.00',
        date: dayjs(dateOutsideBounds).toDate(),
        comment: 'Old',
        tags: [],
      })
    )

    await waitFor(
      () => {
        expect(store.getState().transaction.status).toBe('success')
      },
      { timeout: 3000 }
    )

    const { transaction, account } = store.getState()
    const inserted = transaction.transactions.find((t) => t.id === 'transaction-outside')
    expect(inserted).toBeUndefined()
    expect(account.accounts.some((a) => a.id === mockAccount.id)).toBe(true)
    expect(account.summary).toEqual(mockAccountSummary)
  })

  it('createTransaction API error: status is failed, state unchanged', async () => {
    server.use(
      http.post('http://localhost/v1/transactions', () =>
        HttpResponse.json(
          { message: 'Server error', statusCode: 500 },
          { status: 500 }
        )
      )
    )

    const store = createStore()
    store.dispatch(
      createTransaction({
        account: mockAccount.id,
        category: 'category-1',
        amount: '1.00',
        date: dayjs().toDate(),
        comment: '',
        tags: [],
      })
    )

    await waitFor(
      () => {
        expect(store.getState().transaction.status).toBe('failed')
      },
      { timeout: 3000 }
    )

    expect(store.getState().transaction.transactions).toHaveLength(0)
  })

  it('deleteTransaction: transaction removed from list', async () => {
    const store = createStore({
      transaction: {
        transactions: [
          mockTransaction,
          createMockTransaction({ id: 'to-delete' }),
        ],
        summary: null,
        status: 'idle',
      },
    })

    store.dispatch(deleteTransaction('to-delete'))

    await waitFor(
      () => {
        const list = store.getState().transaction.transactions
        expect(list.some((t) => t.id === 'to-delete')).toBe(false)
      },
      { timeout: 3000 }
    )

    expect(store.getState().transaction.transactions).toHaveLength(1)
    expect(store.getState().transaction.transactions[0].id).toBe(
      mockTransaction.id
    )
  })
})
