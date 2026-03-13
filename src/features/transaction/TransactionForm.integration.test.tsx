import { describe, it, expect } from 'vitest'
import { waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'

import dayjs from '@/lib/dayjs'
import { renderWithProviders } from '@/testing/render'
import { server } from '@/testing/server'
import { createStore } from '@/store'
import { createTransaction } from '@/store/slices/transaction'
import { TransactionTypeTabs } from '@/features/transaction-type'
import { TransactionForm } from '@/features/transaction/components/TransactionForm'
import type { TransactionFormType } from '@/features/transaction/types'
import { mockAccount, mockAccountSummary } from '@/testing/data/account'
import { mockCategory } from '@/testing/data/category'
import { createMockTransaction } from '@/testing/data/transaction'

describe('TransactionForm (integration)', () => {
  it('submit: fills amount, calls POST /transactions, store updated on success', async () => {
    const newTransaction = createMockTransaction({
      id: 'transaction-new',
      comment: 'Test note',
    })
    server.use(
      http.post('http://localhost/v1/transactions', async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>
        expect(body.amount).toBeDefined()
        expect(body.account).toBe(mockAccount.id)
        expect(body.category).toBe(mockCategory.id)
        return HttpResponse.json({
          transaction: newTransaction,
          accounts: [mockAccount],
          summary: mockAccountSummary,
        })
      })
    )

    const store = createStore({
      account: {
        accounts: [mockAccount],
        summary: mockAccountSummary,
        status: 'success',
      },
      category: { categories: [mockCategory], status: 'success' },
      transactionType: { transactionType: 'expense' },
    })

    const defaultValues: TransactionFormType = {
      amount: '',
      account: mockAccount.id,
      category: mockCategory.id,
      comment: '',
      tags: [],
      date: dayjs().toDate(),
    }

    const user = userEvent.setup()
    const { getByRole, getByPlaceholderText } = renderWithProviders(
      <TransactionTypeTabs>
        <TransactionForm
          defaultValues={defaultValues}
          onSubmit={async (values) => {
            await store.dispatch(createTransaction(values)).unwrap()
          }}
        />
      </TransactionTypeTabs>,
      { store }
    )

    const amountInput = getByPlaceholderText('0')
    await user.type(amountInput, '25.50')
    await user.click(getByRole('button', { name: 'Add transaction' }))

    await waitFor(
      () => {
        const transactions = store.getState().transaction.transactions
        expect(transactions.some((t) => t.id === 'transaction-new')).toBe(true)
      },
      { timeout: 3000 }
    )
  })

  it('submit: API error does not add transaction', async () => {
    server.use(
      http.post('http://localhost/v1/transactions', () =>
        HttpResponse.json(
          { message: 'Server error', statusCode: 500 },
          { status: 500 }
        )
      )
    )

    const store = createStore({
      account: {
        accounts: [mockAccount],
        summary: mockAccountSummary,
        status: 'success',
      },
      category: { categories: [mockCategory], status: 'success' },
      transactionType: { transactionType: 'expense' },
    })

    const defaultValues: TransactionFormType = {
      amount: '',
      account: mockAccount.id,
      category: mockCategory.id,
      comment: '',
      tags: [],
      date: dayjs().toDate(),
    }

    const user = userEvent.setup()
    const { getByRole, getByPlaceholderText } = renderWithProviders(
      <TransactionTypeTabs>
        <TransactionForm
          defaultValues={defaultValues}
          onSubmit={async (values) => {
            try {
              await store.dispatch(createTransaction(values)).unwrap()
            } catch {
              // expected on API error
            }
          }}
        />
      </TransactionTypeTabs>,
      { store }
    )

    await user.type(getByPlaceholderText('0'), '10')
    await user.click(getByRole('button', { name: 'Add transaction' }))

    await waitFor(() => {
      expect(store.getState().transaction.transactions).toHaveLength(0)
      expect(store.getState().transaction.status).toBe('failed')
    })
  })
})
