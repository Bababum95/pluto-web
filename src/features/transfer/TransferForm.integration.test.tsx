import { describe, it, expect } from 'vitest'
import { waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'

import { renderWithProviders } from '@/testing/render'
import { server } from '@/testing/server'
import { createStore } from '@/store'
import { createTransfer } from '@/store/slices/transfer'
import { TransferForm } from '@/features/transfer/components/TransferForm'
import { mockAccount, mockAccountSummary } from '@/testing/data/account'
import { createMockAccount } from '@/testing/data/account'
import { mockExchangeRate } from '@/testing/data/exchange-rate'
import { createMockTransfer } from '@/testing/data/transfer'

const account2 = createMockAccount({
  id: 'account-2',
  name: 'Savings',
  order: 2,
})

describe('TransferForm (integration)', () => {
  it('submit: fills fromAmount, calls POST /transfers, store updated on success', async () => {
    const newTransfer = createMockTransfer({ id: 'transfer-new' })
    server.use(
      http.post('http://localhost/v1/transfers', async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>
        expect(body.from).toBeDefined()
        expect(body.to).toBeDefined()
        expect(body.rate).toBeDefined()
        return HttpResponse.json(newTransfer, { status: 201 })
      })
    )

    const store = createStore({
      account: {
        accounts: [mockAccount, account2],
        summary: mockAccountSummary,
        status: 'success',
      },
      exchangeRate: {
        rates: [mockExchangeRate],
        status: 'success',
      },
    })

    const user = userEvent.setup()
    const { getByRole, getAllByPlaceholderText } = renderWithProviders(
      <TransferForm
        defaultValues={{
          fromAccount: mockAccount.id,
          toAccount: account2.id,
          fromAmount: '',
          toAmount: '',
          rate: '',
          fee: '',
          feeType: 'percent',
        }}
        onSubmit={async (values) => {
          await store.dispatch(createTransfer(values)).unwrap()
        }}
      />,
      { store }
    )

    const amountInputs = getAllByPlaceholderText('0')
    const fromAmountInput = amountInputs[0]
    await user.type(fromAmountInput, '100')
    await user.click(getByRole('button', { name: 'Create transfer' }))

    await waitFor(
      () => {
        const transfers = store.getState().transfer.transfers
        expect(transfers.some((t) => t.id === 'transfer-new')).toBe(true)
      },
      { timeout: 3000 }
    )
  })

  it('submit: API error does not add transfer', async () => {
    server.use(
      http.post('http://localhost/v1/transfers', () =>
        HttpResponse.json(
          { message: 'Server error', statusCode: 500 },
          { status: 500 }
        )
      )
    )

    const store = createStore({
      account: {
        accounts: [mockAccount, account2],
        summary: mockAccountSummary,
        status: 'success',
      },
      exchangeRate: {
        rates: [mockExchangeRate],
        status: 'success',
      },
    })

    const user = userEvent.setup()
    const { getByRole, getAllByPlaceholderText } = renderWithProviders(
      <TransferForm
        defaultValues={{
          fromAccount: mockAccount.id,
          toAccount: account2.id,
          fromAmount: '',
          toAmount: '',
          rate: '',
          fee: '',
          feeType: 'percent',
        }}
        onSubmit={async (values) => {
          try {
            await store.dispatch(createTransfer(values)).unwrap()
          } catch {
            // expected on API error
          }
        }}
      />,
      { store }
    )

    await user.type(getAllByPlaceholderText('0')[0], '50')
    await user.click(getByRole('button', { name: 'Create transfer' }))

    await waitFor(() => {
      expect(store.getState().transfer.transfers).toHaveLength(0)
      expect(store.getState().transfer.status).toBe('failed')
    })
  })
})
