import { describe, it, expect } from 'vitest'

import { calculateBaseRate } from './calculateBaseRate'
import type { ExchangeRate } from '@/features/exchange-rate/types'

const ts = '2021-01-01T10:00:00.000Z'
const rates: ExchangeRate[] = [
  { id: 'rate-usd', code: 'USD', value: 1, createdAt: ts, updatedAt: ts },
  { id: 'rate-eur', code: 'EUR', value: 0.92, createdAt: ts, updatedAt: ts },
  { id: 'rate-gbp', code: 'GBP', value: 0.79, createdAt: ts, updatedAt: ts },
]

describe('calculateBaseRate', () => {
  it('returns 1 when from and to are the same', () => {
    expect(calculateBaseRate(rates, 'USD', 'USD')).toBe(1)
    expect(calculateBaseRate(rates, 'EUR', 'EUR')).toBe(1)
  })

  it('computes rate as toValue/fromValue for different currencies', () => {
    expect(calculateBaseRate(rates, 'USD', 'EUR')).toBe(0.92)
    expect(calculateBaseRate(rates, 'EUR', 'USD')).toBe(1 / 0.92)
    expect(calculateBaseRate(rates, 'USD', 'GBP')).toBe(0.79)
    expect(calculateBaseRate(rates, 'GBP', 'EUR')).toBe(0.92 / 0.79)
  })

  it('returns null when from currency not in rates', () => {
    expect(calculateBaseRate(rates, 'XXX', 'EUR')).toBeNull()
    expect(calculateBaseRate(rates, 'XXX', 'USD')).toBeNull()
  })

  it('returns null when to currency not in rates', () => {
    expect(calculateBaseRate(rates, 'USD', 'XXX')).toBeNull()
    expect(calculateBaseRate(rates, 'EUR', 'YYY')).toBeNull()
  })

  it('returns null when rates array is empty', () => {
    expect(calculateBaseRate([], 'USD', 'EUR')).toBeNull()
  })

  it('handles rate with decimal precision', () => {
    const result = calculateBaseRate(rates, 'EUR', 'USD')
    expect(result).toBeCloseTo(1.0869565217391304)
  })
})
