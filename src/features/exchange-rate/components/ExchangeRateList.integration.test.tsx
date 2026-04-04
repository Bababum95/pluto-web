import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { renderWithProviders } from '@/testing/render'
import { createMockExchangeRate, mockSettings } from '@/testing/data'

import { ExchangeRateList } from './ExchangeRateList'

describe('ExchangeRateList (integration)', () => {
  it('shows loader state while exchange rates are pending', () => {
    renderWithProviders(<ExchangeRateList />, {
      preloadedState: {
        exchangeRate: {
          rates: [],
          status: 'pending',
        },
        settings: {
          settings: mockSettings,
          status: 'success',
        },
      },
    })

    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument()
  })

  it('renders rates and supports filtering by currency code', async () => {
    const user = userEvent.setup()

    renderWithProviders(<ExchangeRateList />, {
      preloadedState: {
        exchangeRate: {
          rates: [
            createMockExchangeRate({
              id: 'rate-usd',
              code: 'USD',
              value: 1.25,
              updatedAt: '2024-03-10T11:20:00.000Z',
            }),
            createMockExchangeRate({
              id: 'rate-eur',
              code: 'EUR',
              value: 0.95,
              updatedAt: '2024-03-10T11:20:00.000Z',
            }),
          ],
          status: 'success',
        },
        settings: {
          settings: mockSettings,
          status: 'success',
        },
      },
    })

    expect(screen.getAllByText('USD').length).toBeGreaterThan(1)
    expect(screen.getByText('EUR')).toBeInTheDocument()

    await user.type(screen.getByRole('searchbox'), 'eur')

    expect(screen.getAllByText('USD')).toHaveLength(1)
    expect(screen.getByText('EUR')).toBeInTheDocument()
  })
})
