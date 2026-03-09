import { describe, it, expect } from 'vitest'
import { waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'

import { server } from '@/testing/server'
import { createStore } from '@/store'
import {
  fetchAccounts,
  createAccount,
  deleteAccount,
} from '@/store/slices/account'
import { createTransaction } from '@/store/slices/transaction'
import {
  mockAccount,
  mockAccountSummary,
  createMockAccount,
} from '@/testing/data/account'
import { createMockTransaction } from '@/testing/data/transaction'
import dayjs from '@/lib/dayjs'

describe('Account flow (integration)', () => {
  it('fetchAccounts: API populates list and summary', async () => {
    const store = createStore()

    store.dispatch(fetchAccounts())

    await waitFor(
      () => {
        expect(store.getState().account.status).toBe('success')
      },
      { timeout: 3000 }
    )

    const { account } = store.getState()
    expect(account.accounts).toHaveLength(1)
    expect(account.accounts[0].id).toBe(mockAccount.id)
    expect(account.summary).toEqual(mockAccountSummary)
  })

  it('createAccount: API returns account and summary, store updated', async () => {
    const newAccount = createMockAccount({
      id: 'account-2',
      name: 'Savings',
    })
    const newSummary = { ...mockAccountSummary, total_raw: 200000 }
    server.use(
      http.post('http://localhost/v1/accounts', () =>
        HttpResponse.json({
          account: newAccount,
          summary: newSummary,
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

    store.dispatch(
      createAccount({
        name: 'Savings',
        currency: mockAccount.balance.original.currency?.id ?? '',
        color: '#10B981',
        icon: 'wallet',
        balance: 0,
        scale: 2,
      })
    )

    await waitFor(
      () => {
        const accounts = store.getState().account.accounts
        expect(accounts.some((a) => a.id === 'account-2')).toBe(true)
      },
      { timeout: 3000 }
    )

    expect(store.getState().account.accounts).toHaveLength(2)
    expect(store.getState().account.summary).toEqual(newSummary)
  })

  it('deleteAccount: account removed, summary from API', async () => {
    const secondAccount = createMockAccount({ id: 'account-2' })
    const summaryAfterDelete = { ...mockAccountSummary, total_raw: 0 }
    server.use(
      http.get('http://localhost/v1/accounts', () =>
        HttpResponse.json({
          list: [mockAccount, secondAccount],
          summary: mockAccountSummary,
        })
      ),
      http.delete('http://localhost/v1/accounts/account-2', () =>
        HttpResponse.json(summaryAfterDelete)
      )
    )

    const store = createStore()
    store.dispatch(fetchAccounts())
    await waitFor(() => {
      expect(store.getState().account.accounts).toHaveLength(2)
    })

    store.dispatch(deleteAccount('account-2'))

    await waitFor(
      () => {
        expect(store.getState().account.accounts).toHaveLength(1)
        expect(store.getState().account.accounts[0].id).toBe(mockAccount.id)
        expect(store.getState().account.summary).toEqual(summaryAfterDelete)
      },
      { timeout: 3000 }
    )
  })

  it('createTransaction updates account slice: balance and summary from response', async () => {
    const updatedAccount = createMockAccount({
      id: mockAccount.id,
      name: mockAccount.name,
      balance: {
        original: {
          value: 950,
          raw: 95000,
          scale: 2,
          currency: mockAccount.balance.original.currency,
        },
        converted: {
          value: 950,
          raw: 95000,
          scale: 2,
          currency: mockAccount.balance.converted.currency,
        },
      },
    })
    const updatedSummary = { ...mockAccountSummary, total_raw: 95000 }
    server.use(
      http.post('http://localhost/v1/transactions', () =>
        HttpResponse.json({
          accounts: [updatedAccount],
          summary: updatedSummary,
          transaction: createMockTransaction({ id: 'tx-1' }),
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

    store.dispatch(
      createTransaction({
        account: mockAccount.id,
        category: 'category-1',
        amount: '50.00',
        date: dayjs().toDate(),
        comment: '',
        tags: [],
      })
    )

    await waitFor(
      () => {
        expect(store.getState().transaction.status).toBe('success')
      },
      { timeout: 3000 }
    )

    const accountState = store.getState().account
    const acc = accountState.accounts.find((a) => a.id === mockAccount.id)
    expect(acc?.balance.original.raw).toBe(95000)
    expect(accountState.summary?.total_raw).toBe(95000)
  })
})
