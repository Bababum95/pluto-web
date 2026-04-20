import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { renderWithProviders } from '@/testing/render'
import { mockAccount, createMockAccount } from '@/testing/data'

vi.mock('@/components/ui/drawer', () => ({
  Drawer: ({
    children,
    open,
    onOpenChange,
  }: {
    children: React.ReactNode
    open: boolean
    onOpenChange?: (open: boolean) => void
  }) =>
    open ? (
      <div data-testid="mock-drawer">
        <button type="button" onClick={() => onOpenChange?.(true)}>
          keep-drawer-open
        </button>
        <button type="button" onClick={() => onOpenChange?.(false)}>
          close-drawer
        </button>
        {children}
      </div>
    ) : null,
  DrawerContent: ({ children, ...props }: React.ComponentProps<'div'>) => (
    <div {...props}>{children}</div>
  ),
  DrawerHeader: ({ children, ...props }: React.ComponentProps<'div'>) => (
    <div {...props}>{children}</div>
  ),
  DrawerTitle: ({ children, ...props }: React.ComponentProps<'div'>) => (
    <div {...props}>{children}</div>
  ),
}))

import { AccountDrawer } from './AccountDrawer'

describe('AccountDrawer (integration)', () => {
  it('renders accounts and closes after selecting one', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const onChange = vi.fn()

    renderWithProviders(
      <AccountDrawer
        open={true}
        value={mockAccount.id}
        onClose={onClose}
        onChange={onChange}
      />,
      {
        preloadedState: {
          account: {
            accounts: [
              mockAccount,
              createMockAccount({ id: 'account-2', name: 'Savings Account' }),
            ],
            summary: null,
            status: 'success',
          },
        },
      }
    )

    expect(screen.getByText('Select account')).toBeInTheDocument()
    expect(screen.getAllByRole('radio')).toHaveLength(2)
    expect(
      screen.getAllByRole('radio').filter((radio) =>
        radio.getAttribute('data-state') === 'checked'
      )
    ).toHaveLength(1)

    await user.click(screen.getByText('Savings Account'))

    expect(onChange).toHaveBeenCalledWith('account-2')
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when drawer requests close', () => {
    const onClose = vi.fn()

    renderWithProviders(
      <AccountDrawer
        open={true}
        value={mockAccount.id}
        onClose={onClose}
        onChange={vi.fn()}
      />,
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

    fireEvent.click(screen.getByRole('button', { name: 'close-drawer' }))

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not call onClose when drawer stays open', () => {
    const onClose = vi.fn()

    renderWithProviders(
      <AccountDrawer
        open={true}
        value={mockAccount.id}
        onClose={onClose}
        onChange={vi.fn()}
      />,
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

    fireEvent.click(screen.getByRole('button', { name: 'keep-drawer-open' }))

    expect(onClose).not.toHaveBeenCalled()
  })
})
