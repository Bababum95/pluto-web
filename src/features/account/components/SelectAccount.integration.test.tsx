import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { renderWithProviders } from '@/testing/render'
import { mockAccount } from '@/testing/data'

import { SelectAccount } from './SelectAccount'

vi.mock('./AccountDrawer', () => ({
  AccountDrawer: ({
    open,
    value,
    onClose,
    onChange,
  }: {
    open: boolean
    value?: string
    onClose: () => void
    onChange: (value: string) => void
  }) =>
    open ? (
      <div data-testid="account-drawer">
        <span data-testid="drawer-value">{value ?? 'empty'}</span>
        <button type="button" onClick={() => onChange('account-2')}>
          select-second
        </button>
        <button type="button" onClick={onClose}>
          close-drawer
        </button>
      </div>
    ) : null,
}))

describe('SelectAccount (integration)', () => {
  it('shows selected account card when value exists', () => {
    renderWithProviders(
      <SelectAccount value={mockAccount.id} onChange={vi.fn()} />,
      {
        preloadedState: {
          account: {
            accounts: [mockAccount],
            summary: null,
            status: 'success',
          },
        },
      }
    )

    expect(screen.getByText(mockAccount.name)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Select account' })).toBeNull()
  })

  it('shows fallback button and error message when account is missing', () => {
    renderWithProviders(
      <SelectAccount
        value={undefined}
        onChange={vi.fn()}
        isError={true}
        errorMessage="Account is required"
      />,
      {
        preloadedState: {
          account: {
            accounts: [],
            summary: null,
            status: 'idle',
          },
        },
      }
    )

    expect(
      screen.getByRole('button', { name: 'Select account' })
    ).toBeInTheDocument()
    expect(screen.getByText('Account is required')).toBeInTheDocument()
  })

  it('opens drawer and propagates selected account id', () => {
    const onChange = vi.fn()

    renderWithProviders(<SelectAccount value={undefined} onChange={onChange} />, {
      preloadedState: {
        account: {
          accounts: [mockAccount],
          summary: null,
          status: 'success',
        },
      },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Select account' }))

    expect(screen.getByTestId('account-drawer')).toBeInTheDocument()
    expect(screen.getByTestId('drawer-value')).toHaveTextContent('empty')

    fireEvent.click(screen.getByRole('button', { name: 'select-second' }))

    expect(onChange).toHaveBeenCalledWith('account-2')
    expect(screen.queryByTestId('account-drawer')).toBeNull()
  })
})
