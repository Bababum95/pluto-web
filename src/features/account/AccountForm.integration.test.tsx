import { describe, it, expect } from 'vitest'
import { waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'

import { renderWithProviders } from '@/testing/render'
import { server } from '@/testing/server'
import { createStore } from '@/store'
import { createAccount } from '@/store/slices/account'
import { AccountForm } from '@/features/account'
import { mockAccount, mockAccountSummary } from '@/testing/data/account'
import { mockCurrency } from '@/testing/data/currency'

describe('AccountForm (integration)', () => {
  it('submit: fills name, calls POST /accounts, store updated on success', async () => {
    const newAccount = {
      ...mockAccount,
      id: 'account-new',
      name: 'Savings',
    }
    server.use(
      http.post('http://localhost/v1/accounts', async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>
        expect(body.name).toBe('Savings')
        return HttpResponse.json({
          account: newAccount,
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
    })

    const user = userEvent.setup()
    const { getByRole, getByLabelText } = renderWithProviders(
      <AccountForm
        defaultValues={{
          name: '',
          color: '#00a4e8',
          icon: 'wallet',
          currency: mockCurrency.id,
          balance: '0',
        }}
        onSubmit={async (values) => {
          await store.dispatch(createAccount(values)).unwrap()
        }}
      />,
      { store }
    )

    await user.type(getByLabelText('Account name'), 'Savings')
    await user.click(getByRole('button', { name: 'Create' }))

    await waitFor(
      () => {
        const accounts = store.getState().account.accounts
        expect(accounts.some((a) => a.id === 'account-new')).toBe(true)
        expect(accounts.find((a) => a.id === 'account-new')?.name).toBe(
          'Savings'
        )
      },
      { timeout: 3000 }
    )
  })

  it('submit: API error does not add account, list unchanged', async () => {
    server.use(
      http.post('http://localhost/v1/accounts', () =>
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
    })

    const user = userEvent.setup()
    const { getByRole, getByLabelText } = renderWithProviders(
      <AccountForm
        defaultValues={{
          name: '',
          color: '#00a4e8',
          icon: 'wallet',
          currency: mockCurrency.id,
          balance: '0',
        }}
        onSubmit={async (values) => {
          try {
            await store.dispatch(createAccount(values)).unwrap()
          } catch {
            // expected on API error
          }
        }}
      />,
      { store }
    )

    await user.type(getByLabelText('Account name'), 'Fail')
    await user.click(getByRole('button', { name: 'Create' }))

    await waitFor(() => {
      expect(store.getState().account.accounts).toHaveLength(1)
      expect(store.getState().account.accounts[0].id).toBe(mockAccount.id)
    })
  })
})
