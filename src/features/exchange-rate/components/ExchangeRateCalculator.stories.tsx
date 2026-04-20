import type { Meta, StoryObj } from '@storybook/react-vite'
import { Provider } from 'react-redux'

import { createStore } from '@/store'
import {
  createMockCurrency,
  createMockExchangeRate,
  createMockSettings,
} from '@/testing/data'

import { ExchangeRateCalculator } from './ExchangeRateCalculator'

const meta = {
  title: 'Features/ExchangeRate/ExchangeRateCalculator',
  component: ExchangeRateCalculator,
  tags: ['autodocs'],
} satisfies Meta<typeof ExchangeRateCalculator>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const baseCurrency = createMockCurrency({ code: 'USD', symbol: '$' })
    const store = createStore({
      settings: {
        settings: createMockSettings({ currency: baseCurrency }),
        status: 'success',
      },
      exchangeRate: {
        status: 'success',
        rates: [
          createMockExchangeRate({ id: 'rate-eur', code: 'EUR', value: 0.5 }),
          createMockExchangeRate({ id: 'rate-gbp', code: 'GBP', value: 0.75 }),
        ],
      },
    })

    return (
      <Provider store={store}>
        <div className="max-w-sm p-4">
          <ExchangeRateCalculator />
        </div>
      </Provider>
    )
  },
}
