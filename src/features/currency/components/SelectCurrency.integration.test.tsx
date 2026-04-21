import React from 'react'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { renderWithProviders } from '@/testing/render'
import { createMockCurrency } from '@/testing/data'
import { server } from '@/testing/server'
import { http, HttpResponse } from 'msw'

import { SelectCurrency } from './SelectCurrency'

vi.mock('@/components/ui/drawer', () => ({
  Drawer: ({
    children,
    open,
    onOpenChange,
  }: {
    children: React.ReactNode
    open: boolean
    onOpenChange?: (open: boolean) => void
  }) => (
    <div data-testid="mock-drawer" data-open={open}>
      <button type="button" onClick={() => onOpenChange?.(!open)}>
        toggle-drawer
      </button>
      {children}
    </div>
  ),
  DrawerTrigger: ({
    children,
    asChild,
  }: {
    children: React.ReactElement<{ onClick?: () => void }>
    asChild?: boolean
  }) =>
    asChild
      ? children
      : React.cloneElement(children, {
          onClick: () => undefined,
        }),
  DrawerContent: ({ children, ...props }: React.ComponentProps<'div'>) => (
    <div {...props}>{children}</div>
  ),
  DrawerHeader: ({ children, ...props }: React.ComponentProps<'div'>) => (
    <div {...props}>{children}</div>
  ),
  DrawerTitle: ({ children, ...props }: React.ComponentProps<'div'>) => (
    <div {...props}>{children}</div>
  ),
  DrawerDescription: ({
    children,
    ...props
  }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
}))

describe('SelectCurrency (integration)', () => {
  it('filters currencies by search query and selects a result', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    server.use(
      http.get('http://localhost/v1/currencies', () =>
        HttpResponse.json([
          createMockCurrency({ id: 'currency-usd', code: 'USD', name: 'US Dollar' }),
          createMockCurrency({ id: 'currency-eur', code: 'EUR', name: 'Euro' }),
        ])
      )
    )

    renderWithProviders(<SelectCurrency onChange={onChange} />)

    await waitFor(() => {
      expect(screen.getByText('Currencies')).toBeInTheDocument()
    })

    await user.type(
      screen.getByPlaceholderText('Search by name or code'),
      'eur'
    )

    expect(screen.getByText('Euro')).toBeInTheDocument()
    expect(screen.queryByText('US Dollar')).not.toBeInTheDocument()

    fireEvent.click(screen.getByText('Euro'))

    expect(onChange).toHaveBeenCalledWith('currency-eur')
  })

  it('shows empty state when search has no matches', async () => {
    const user = userEvent.setup()

    renderWithProviders(<SelectCurrency value="currency-1" />)

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search by name or code')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('Search by name or code')
    await user.type(searchInput, 'zzz')
    expect(screen.getByText('No currencies found')).toBeInTheDocument()
  })
})
