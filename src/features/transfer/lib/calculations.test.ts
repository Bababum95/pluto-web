import { describe, it, expect } from 'vitest'

import {
  computeToAmount,
  computeFromAmount,
  computeRate,
} from './calculations'

describe('computeToAmount', () => {
  it('returns empty string when from is zero', () => {
    expect(computeToAmount('0', '1', '0', 'percent')).toBe('')
  })

  it('returns empty string when rate is zero', () => {
    expect(computeToAmount('100', '0', '0', 'percent')).toBe('')
  })

  it('computes to amount with percent fee', () => {
    // 100 * 2 * (1 - 10/100) = 180
    expect(computeToAmount('100', '2', '10', 'percent')).toBe('180')
  })

  it('computes to amount with from_currency fee', () => {
    // (100 - 10) * 2 = 180
    expect(computeToAmount('100', '2', '10', 'from_currency')).toBe('180')
  })

  it('computes to amount with to_currency fee', () => {
    // 100 * 2 - 20 = 180
    expect(computeToAmount('100', '2', '20', 'to_currency')).toBe('180')
  })

  it('returns 0 when result is negative', () => {
    expect(computeToAmount('10', '1', '50', 'from_currency')).toBe('0')
  })

  it('respects decimalDigits option', () => {
    const result = computeToAmount('100', '1.3333', '0', 'percent', 2)
    expect(result).toBe('133.33')
  })

  it('handles invalid from as zero', () => {
    expect(computeToAmount('', '1', '0', 'percent')).toBe('')
  })
})

describe('computeFromAmount', () => {
  it('returns empty string when to is zero', () => {
    expect(computeFromAmount('0', '1', '0', 'percent')).toBe('')
  })

  it('returns empty string when rate is zero', () => {
    expect(computeFromAmount('100', '0', '0', 'percent')).toBe('')
  })

  it('computes from amount with percent fee', () => {
    // to / (rate * (1 - fee/100)); 180 / (2 * 0.9) = 100
    expect(computeFromAmount('180', '2', '10', 'percent')).toBe('100')
  })

  it('computes from amount with from_currency fee', () => {
    // to/rate + fee = 180/2 + 10 = 100
    expect(computeFromAmount('180', '2', '10', 'from_currency')).toBe('100')
  })

  it('computes from amount with to_currency fee', () => {
    // (to + fee) / rate = (180 + 20) / 2 = 100
    expect(computeFromAmount('180', '2', '20', 'to_currency')).toBe('100')
  })

  it('returns 0 when result is negative', () => {
    expect(computeFromAmount('-60', '1', '0', 'to_currency')).toBe('0')
  })

  it('returns empty string when percent factor is zero', () => {
    expect(computeFromAmount('100', '2', '100', 'percent')).toBe('')
  })

  it('respects decimalDigits option', () => {
    const result = computeFromAmount('133.333', '1.333', '0', 'percent', 2)
    expect(result).toBe('100.02')
  })
})

describe('computeRate', () => {
  const rates = [
    { code: 'USD', value: 1 },
    { code: 'EUR', value: 0.92 },
    { code: 'GBP', value: 0.79 },
  ]

  it('returns null when fromCurrencyCode is undefined', () => {
    expect(computeRate(undefined, 'EUR', rates)).toBeNull()
  })

  it('returns null when toCurrencyCode is undefined', () => {
    expect(computeRate('USD', undefined, rates)).toBeNull()
  })

  it('returns "1" when from and to are the same', () => {
    expect(computeRate('USD', 'USD', rates)).toBe('1')
  })

  it('computes rate as toValue/fromValue', () => {
    expect(computeRate('USD', 'EUR', rates)).toBe('0.92')
    expect(computeRate('EUR', 'USD', rates)).toBe('1.08695652')
  })

  it('returns null when from rate not found', () => {
    expect(computeRate('XXX', 'EUR', rates)).toBeNull()
  })

  it('returns null when to rate not found', () => {
    expect(computeRate('USD', 'XXX', rates)).toBeNull()
  })

  it('returns null when from rate value is 0', () => {
    const ratesWithZero = [...rates, { code: 'ZERO', value: 0 }]
    expect(computeRate('ZERO', 'USD', ratesWithZero)).toBeNull()
  })
})
