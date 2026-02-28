import Decimal from 'decimal.js'
import { describe, it, expect } from 'vitest'

import { deriveFromAmount } from './deriveFromAmount'

describe('deriveFromAmount', () => {
  const rate = new Decimal(2)

  it('returns from when from is provided', () => {
    const from = new Decimal(100)
    const result = deriveFromAmount({
      from,
      to: new Decimal(200),
      rate,
      fee: null,
      feeType: 'percent',
    })
    expect(result).toEqual(from)
  })

  it('returns null when from is null and to is null', () => {
    const result = deriveFromAmount({
      from: null,
      to: null,
      rate,
      fee: null,
      feeType: 'percent',
    })
    expect(result).toBeNull()
  })

  it('derives from as to/rate when no fee', () => {
    const result = deriveFromAmount({
      from: null,
      to: new Decimal(200),
      rate,
      fee: null,
      feeType: 'percent',
    })
    expect(result?.toNumber()).toBe(100)
  })

  it('adds to_currency fee to to before dividing by rate', () => {
    // netTo = 200 + 10 = 210, from = 210/2 = 105
    const result = deriveFromAmount({
      from: null,
      to: new Decimal(200),
      rate,
      fee: new Decimal(10),
      feeType: 'to_currency',
    })
    expect(result?.toNumber()).toBe(105)
  })

  it('adds from_currency fee to base from', () => {
    // baseFrom = 200/2 = 100, from = 100 + 5 = 105
    const result = deriveFromAmount({
      from: null,
      to: new Decimal(200),
      rate,
      fee: new Decimal(5),
      feeType: 'from_currency',
    })
    expect(result?.toNumber()).toBe(105)
  })

  it('applies percent fee: baseFrom / (1 - fee/100)', () => {
    // baseFrom = 200/2 = 100, percent 5% => 100 / 0.95 ≈ 105.26
    const result = deriveFromAmount({
      from: null,
      to: new Decimal(200),
      rate,
      fee: new Decimal(5),
      feeType: 'percent',
    })
    const expected = new Decimal(100).div(new Decimal(0.95))
    expect(result?.toFixed(4)).toBe(expected.toFixed(4))
  })

  it('returns baseFrom when fee is null regardless of feeType', () => {
    const result = deriveFromAmount({
      from: null,
      to: new Decimal(200),
      rate,
      fee: null,
      feeType: 'from_currency',
    })
    expect(result?.toNumber()).toBe(100)
  })
})
