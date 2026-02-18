import type { components } from '@/lib/api/types'

export type MoneyView = components['schemas']['MoneyViewDto']
export type MoneyViewCurrency = components['schemas']['MoneyViewCurrencyDto']

export type FormatBalanceParams = {
  balance: number
  currency: {
    code: string
    decimal_digits: number
  }
}
