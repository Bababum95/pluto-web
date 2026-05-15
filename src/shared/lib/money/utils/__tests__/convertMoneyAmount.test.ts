import { describe, it, expect } from 'vitest'

import { convertMoneyAmount } from '../convertMoneyAmount'
import type { RateDto } from '@/entities/exchange-rate'
import type { MoneyViewCurrencyDto } from '@/shared/lib/money/types'

const ts = '2021-01-01T10:00:00.000Z'

const usd: MoneyViewCurrencyDto = {
  id: 'currency-usd',
  code: 'USD',
  symbol: '$',
  decimal_digits: 2,
}

const eur: MoneyViewCurrencyDto = {
  id: 'currency-eur',
  code: 'EUR',
  symbol: '€',
  decimal_digits: 2,
}

const rates: RateDto[] = [
  { id: 'rate-usd', code: 'USD', value: 1, createdAt: ts, updatedAt: ts },
  { id: 'rate-eur', code: 'EUR', value: 0.8, createdAt: ts, updatedAt: ts },
]

describe('convertMoneyAmount', () => {
  it('returns original minor units when source and target currency match', () => {
    const result = convertMoneyAmount({
      amountRaw: -150050,
      scale: 2,
      sourceCurrency: usd,
      targetCurrency: usd,
      rates,
    })

    expect(result).toEqual({
      value: -1500.5,
      raw: -150050,
      scale: 2,
      currency: usd,
    })
  })

  it('converts via USD rates using Decimal (matches API MoneyService)', () => {
    const result = convertMoneyAmount({
      amountRaw: 150050,
      scale: 2,
      sourceCurrency: usd,
      targetCurrency: eur,
      rates,
    })

    expect(result).not.toBeNull()
    expect(result?.currency).toEqual(eur)
    expect(result?.raw).toBe(120040)
    expect(result?.value).toBeCloseTo(1200.4)
  })

  it('returns null when a rate is missing', () => {
    const result = convertMoneyAmount({
      amountRaw: 10000,
      scale: 2,
      sourceCurrency: usd,
      targetCurrency: { ...eur, code: 'GBP' },
      rates,
    })

    expect(result).toBeNull()
  })
})
