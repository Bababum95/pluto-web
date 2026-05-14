import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import * as ExchangeRateCalculatorStories from './exchange-rate-calculator.stories'

describe('ExchangeRateCalculator stories', () => {
  it('renders exchange rate calculator story', () => {
    render(
      ExchangeRateCalculatorStories.Default.render?.({}, {} as never) ?? null
    )

    expect(
      screen.getByRole('textbox', { name: 'Amount to convert' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('textbox', { name: 'Converted amount' })
    ).toHaveValue('0.50')
  })
})
