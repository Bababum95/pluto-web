import Decimal from 'decimal.js'
import { describe, it, expect } from 'vitest'

import { deriveToAmount } from './deriveToAmount'

describe('deriveToAmount', () => {
  const rate = new Decimal(2)

  it('returns to when to is provided', () => {
    const to = new Decimal(200)
    const result = deriveToAmount({
      from: new Decimal(100),
      to,
      rate,
      fee: null,
      feeType: 'percent',
    })
    expect(result).toEqual(to)
  })

  it('returns null when to is null and from is null', () => {
    const result = deriveToAmount({
      from: null,
      to: null,
      rate,
      fee: null,
      feeType: 'percent',
    })
    expect(result).toBeNull()
  })

  it('derives to as from*rate when no fee', () => {
    const result = deriveToAmount({
      from: new Decimal(100),
      to: null,
      rate,
      fee: null,
      feeType: 'percent',
    })
    expect(result?.toNumber()).toBe(200)
  })

  it('applies percent fee: reduces from then multiplies by rate', () => {
    // 100 - 10% = 90, to = 90 * 2 = 180
    const result = deriveToAmount({
      from: new Decimal(100),
      to: null,
      rate,
      fee: new Decimal(10),
      feeType: 'percent',
    })
    expect(result?.toNumber()).toBe(180)
  })

  it('applies from_currency fee: subtracts fee from from then multiplies by rate', () => {
    // netFrom = 100 - 10 = 90, to = 90 * 2 = 180
    const result = deriveToAmount({
      from: new Decimal(100),
      to: null,
      rate,
      fee: new Decimal(10),
      feeType: 'from_currency',
    })
    expect(result?.toNumber()).toBe(180)
  })

  it('applies to_currency fee: subtracts fee from result', () => {
    // from*rate = 200, to = 200 - 20 = 180
    const result = deriveToAmount({
      from: new Decimal(100),
      to: null,
      rate,
      fee: new Decimal(20),
      feeType: 'to_currency',
    })
    expect(result?.toNumber()).toBe(180)
  })

  it('returns from*rate when fee is null regardless of feeType', () => {
    const result = deriveToAmount({
      from: new Decimal(100),
      to: null,
      rate,
      fee: null,
      feeType: 'to_currency',
    })
    expect(result?.toNumber()).toBe(200)
  })
})
