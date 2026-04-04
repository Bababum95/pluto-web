import { describe, it, expect } from 'vitest'
import { waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'

import dayjs from '@/lib/dayjs'
import { server } from '@/testing/server'
import { createStore } from '@/store'
import {
  createTransaction,
  deleteTransaction,
  updateTransaction,
  fetchTransactions,
} from '@/store/slices/transaction'
import {
  mockTransaction,
  createMockTransaction,
} from '@/testing/data/transaction'
import { mockAccount, mockAccountSummary } from '@/testing/data/account'
import { getTimeRangeBounds } from '@/features/time-range'

describe('Transaction flow (integration)', () => {
  it('fetchTransactions: GET /transactions with type, from, to query params from store', async () => {
    let capturedUrl = ''
    server.use(
      http.get('http://localhost/v1/transactions', ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json([mockTransaction])
      })
    )
    const store = createStore({
      timeRange: {
        type: 'month',
        index: 0,
        range: getTimeRangeBounds('month', 0),
      },
      transactionType: { transactionType: 'expense' },
    })
    store.dispatch(fetchTransactions())
    await waitFor(
      () => {
        expect(store.getState().transaction.status).toBe('success')
      },
      { timeout: 3000 }
    )
    const url = new URL(capturedUrl)
    expect(url.searchParams.get('type')).toBe('expense')
    expect(url.searchParams.get('from')).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(url.searchParams.get('to')).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('createTransaction: POST /transactions body has account, category, amount, date, type, scale', async () => {
    const newTx = createMockTransaction({ id: 'tx-from-body-test' })
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.post('http://localhost/v1/transactions', async ({ request }) => {
        capturedBody = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({
          accounts: [mockAccount],
          summary: mockAccountSummary,
          transaction: newTx,
        })
      })
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
        category: 'cat-1',
        amount: '25.50',
        date: dayjs(today).toDate(),
        comment: 'Comment',
        tags: ['tag1'],
      })
    )
    await waitFor(
      () => {
        expect(store.getState().transaction.status).toBe('success')
      },
      { timeout: 3000 }
    )
    expect(capturedBody).toMatchObject({
      account: mockAccount.id,
      category: 'cat-1',
      amount: 2550,
      date: today,
      type: 'expense',
      scale: 2,
      comment: 'Comment',
      tags: ['tag1'],
    })
  })

  it('createTransaction: API call, store transaction list and summary updated, account updated', async () => {
    const updatedAccount = { ...mockAccount, name: 'Updated Wallet' }
    const updatedSummary = { ...mockAccountSummary, total_raw: 99000 }
    server.use(
      http.post('http://localhost/v1/transactions', () =>
        HttpResponse.json({
          accounts: [updatedAccount],
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
          accounts: [mockAccount],
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
    const inserted = transaction.transactions.find(
      (t) => t.id === 'transaction-outside'
    )
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
        current: null,
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

  it('updateTransaction: PATCH body (amount, date, type), store transaction and account updated', async () => {
    const transactionId = mockTransaction.id
    const updatedAccount = { ...mockAccount, name: 'Wallet After Edit' }
    const updatedSummary = { ...mockAccountSummary, total_raw: 88000 }
    const updatedTransaction = createMockTransaction({
      id: transactionId,
      comment: 'Updated comment',
      amount: {
        original: {
          value: -25,
          raw: -2500,
          scale: 2,
          currency: mockTransaction.amount.original.currency,
        },
        converted: {
          value: -25,
          raw: -2500,
          scale: 2,
          currency: mockTransaction.amount.converted.currency,
        },
      },
      date: '2024-02-20',
    })

    let capturedBody: Record<string, unknown> = {}
    const capturedParams: Record<string, string> = {}
    server.use(
      http.patch(
        `http://localhost/v1/transactions/${transactionId}`,
        async ({ request }) => {
          capturedBody = (await request.json()) as Record<string, unknown>
          const url = new URL(request.url)
          url.searchParams.forEach((v, k) => {
            capturedParams[k] = v
          })
          return HttpResponse.json({
            transaction: updatedTransaction,
            accounts: [updatedAccount],
            summary: updatedSummary,
          })
        }
      )
    )

    const store = createStore({
      transaction: {
        transactions: [mockTransaction],
        summary: null,
        status: 'idle',
        current: null,
      },
      account: {
        accounts: [mockAccount],
        summary: mockAccountSummary,
        status: 'success',
      },
      transactionType: { transactionType: 'expense' },
    })

    const newAmount = '25.00'
    const newDate = dayjs('2024-02-20').toDate()
    const result = await store.dispatch(
      updateTransaction({
        id: transactionId,
        data: {
          account: mockAccount.id,
          category: mockTransaction.category.id,
          amount: newAmount,
          date: newDate,
          comment: 'Updated comment',
          tags: [],
        },
        recalcBalance: true,
      })
    )

    expect(result.type).toBe(updateTransaction.fulfilled.type)

    expect(capturedBody).toMatchObject({
      amount: 2500,
      scale: 2,
      date: '2024-02-20',
      type: 'expense',
      comment: 'Updated comment',
    })
    expect(capturedParams).toEqual({ recalcBalance: 'true' })

    const { transaction, account } = store.getState()
    const updated = transaction.transactions.find((t) => t.id === transactionId)
    expect(updated).toEqual(updatedTransaction)
    expect(account.accounts).toContainEqual(
      expect.objectContaining({ id: mockAccount.id, name: 'Wallet After Edit' })
    )
    expect(account.summary).toEqual(updatedSummary)
  })

  it('updateTransaction API error: rejected, store unchanged', async () => {
    const transactionId = mockTransaction.id
    server.use(
      http.patch(`http://localhost/v1/transactions/${transactionId}`, () =>
        HttpResponse.json(
          { message: 'Conflict', statusCode: 409 },
          { status: 409 }
        )
      )
    )

    const store = createStore({
      transaction: {
        transactions: [mockTransaction],
        summary: null,
        status: 'idle',
        current: null,
      },
      transactionType: { transactionType: 'expense' },
    })

    const result = await store.dispatch(
      updateTransaction({
        id: transactionId,
        data: {
          account: mockAccount.id,
          category: mockTransaction.category.id,
          amount: '10.00',
          date: dayjs().toDate(),
          comment: '',
          tags: [],
        },
      })
    )

    expect(result.type).toBe(updateTransaction.rejected.type)
    expect(store.getState().transaction.transactions).toHaveLength(1)
    expect(store.getState().transaction.transactions[0]).toEqual(
      mockTransaction
    )
  })
})
