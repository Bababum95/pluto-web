import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'

import { renderWithProviders } from '@/testing/render'
import { createStore } from '@/store'
import { Total } from './Total'
import { mockAccountSummary } from '@/testing/data/account'
import { mockCurrency } from '@/testing/data/currency'

describe('Total', () => {
  it('renders label and formatted balance from store summary', () => {
    const store = createStore({
      account: {
        accounts: [],
        summary: mockAccountSummary,
        status: 'success',
      },
    })
    renderWithProviders(<Total />, { store })
    expect(screen.getByText(/Total/)).toBeInTheDocument()
    const balanceEl = screen.getByText(/\d/)
    expect(balanceEl).toBeInTheDocument()
    expect(balanceEl.textContent).toContain('1')
    expect(balanceEl.textContent).toContain('000')
  })

  it('shows loading state when account status is pending', () => {
    const store = createStore({
      account: {
        accounts: [],
        summary: mockAccountSummary,
        status: 'pending',
      },
    })
    const { container } = renderWithProviders(<Total />, { store })
    expect(
      container.querySelector('[class*="animate-pulse"]')
    ).toBeInTheDocument()
  })

  it('renders balance with different scale and currency from summary', () => {
    const summaryWithEur = {
      ...mockAccountSummary,
      total: 99.99,
      scale: 2,
      currency: { ...mockCurrency, code: 'EUR', decimal_digits: 2 },
    }
    const store = createStore({
      account: {
        accounts: [],
        summary: summaryWithEur,
        status: 'success',
      },
    })
    renderWithProviders(<Total />, { store })
    const balanceEl = screen.getByText(/\d/)
    expect(balanceEl.textContent).toContain('99')
  })

  it('applies size variant class to balance', () => {
    const store = createStore({
      account: {
        accounts: [],
        summary: mockAccountSummary,
        status: 'success',
      },
    })
    const { container } = renderWithProviders(<Total size="lg" />, { store })
    expect(container.querySelector('.text-4xl')).toBeInTheDocument()
  })
})
