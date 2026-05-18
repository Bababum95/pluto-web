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

  it('handles zero amount', () => {
    const result = convertMoneyAmount({
      amountRaw: 0,
      scale: 2,
      sourceCurrency: usd,
      targetCurrency: eur,
      rates,
    })

    expect(result).not.toBeNull()
    expect(result?.raw).toBe(0)
    expect(result?.value).toBe(0)
  })

  it('handles negative amounts in conversion', () => {
    const result = convertMoneyAmount({
      amountRaw: -100000,
      scale: 2,
      sourceCurrency: usd,
      targetCurrency: eur,
      rates,
    })

    expect(result).not.toBeNull()
    expect(result?.raw).toBe(-80000)
    expect(result?.value).toBeCloseTo(-800)
  })

  it('returns null when source rate is missing', () => {
    const gbp: MoneyViewCurrencyDto = {
      id: 'currency-gbp',
      code: 'GBP',
      symbol: '£',
      decimal_digits: 2,
    }

    const result = convertMoneyAmount({
      amountRaw: 10000,
      scale: 2,
      sourceCurrency: gbp,
      targetCurrency: eur,
      rates,
    })

    expect(result).toBeNull()
  })

  it('returns null when target rate is missing', () => {
    const gbp: MoneyViewCurrencyDto = {
      id: 'currency-gbp',
      code: 'GBP',
      symbol: '£',
      decimal_digits: 2,
    }

    const result = convertMoneyAmount({
      amountRaw: 10000,
      scale: 2,
      sourceCurrency: usd,
      targetCurrency: gbp,
      rates,
    })

    expect(result).toBeNull()
  })

  it('handles different decimal scales', () => {
    const jpy: MoneyViewCurrencyDto = {
      id: 'currency-jpy',
      code: 'JPY',
      symbol: '¥',
      decimal_digits: 0,
    }

    const jpy_rate: RateDto = {
      id: 'rate-jpy',
      code: 'JPY',
      value: 110,
      createdAt: ts,
      updatedAt: ts,
    }

    const result = convertMoneyAmount({
      amountRaw: 10000,
      scale: 2,
      sourceCurrency: usd,
      targetCurrency: jpy,
      rates: [...rates, jpy_rate],
    })

    expect(result).not.toBeNull()
    expect(result?.scale).toBe(0)
    expect(result?.currency).toEqual(jpy)
  })

  it('handles empty rates array', () => {
    const result = convertMoneyAmount({
      amountRaw: 10000,
      scale: 2,
      sourceCurrency: usd,
      targetCurrency: eur,
      rates: [],
    })

    expect(result).toBeNull()
  })
})
