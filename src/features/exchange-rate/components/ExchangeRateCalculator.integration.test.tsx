import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { renderWithProviders } from '@/testing/render'
import {
  createMockCurrency,
  createMockExchangeRate,
  createMockSettings,
} from '@/testing/data'

import { ExchangeRateCalculator } from './ExchangeRateCalculator'

describe('ExchangeRateCalculator (integration)', () => {
  it('renders converted amount and swaps currencies', async () => {
    const user = userEvent.setup()
    const baseCurrency = createMockCurrency({ code: 'USD', symbol: '$' })

    renderWithProviders(<ExchangeRateCalculator />, {
      preloadedState: {
        settings: {
          settings: createMockSettings({ currency: baseCurrency }),
          status: 'success',
        },
        exchangeRate: {
          status: 'success',
          rates: [createMockExchangeRate({ code: 'EUR', value: 0.5 })],
        },
      },
    })

    const fromInput = screen.getByRole('textbox', {
      name: 'Amount to convert',
    })
    const toInput = screen.getByRole('textbox', {
      name: 'Converted amount',
    })

    expect(fromInput).toHaveValue('1')
    expect(toInput).toHaveValue('0.50')

    await user.clear(fromInput)
    await user.type(fromInput, '2')
    expect(fromInput).toHaveValue('2')
    expect(toInput).toHaveValue('1.00')

    await user.click(screen.getByRole('button', { name: 'Swap currencies' }))

    expect(fromInput).toHaveValue('1.00')
    expect(toInput).toHaveValue('2.00')
  })

  it('ignores invalid characters and hides when rates are unavailable', async () => {
    const user = userEvent.setup()
    const baseCurrency = createMockCurrency({ code: 'USD', symbol: '$' })

    renderWithProviders(<ExchangeRateCalculator />, {
      preloadedState: {
        settings: {
          settings: createMockSettings({ currency: baseCurrency }),
          status: 'success',
        },
        exchangeRate: {
          status: 'success',
          rates: [
            createMockExchangeRate({ code: 'EUR', value: 0.5 }),
            createMockExchangeRate({ code: 'GBP', value: 0.75 }),
          ],
        },
      },
    })

    const fromInput = screen.getByRole('textbox', {
      name: 'Amount to convert',
    })

    await user.clear(fromInput)
    await user.type(fromInput, '12abc')
    expect(fromInput).toHaveValue('12')
  })
})
