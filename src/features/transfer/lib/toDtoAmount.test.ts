import Decimal from 'decimal.js'
import { describe, it, expect } from 'vitest'

import { toDtoAmount } from './toDtoAmount'

describe('toDtoAmount', () => {
  it('converts integer amount to value and scale', () => {
    const result = toDtoAmount(new Decimal(100))
    expect(result).toEqual({ value: 100, scale: 0 })
  })

  it('converts decimal amount: preserves scale and normalizes value', () => {
    const result = toDtoAmount(new Decimal('123.45'))
    expect(result).toEqual({ value: 12345, scale: 2 })
  })

  it('handles zero', () => {
    const result = toDtoAmount(new Decimal(0))
    expect(result).toEqual({ value: 0, scale: 0 })
  })

  it('handles small decimal with many places', () => {
    const result = toDtoAmount(new Decimal('0.00001234'))
    expect(result).toEqual({ value: 1234, scale: 8 })
  })

  it('normalizes trailing zeros: decimal places reflect significant digits only', () => {
    // Decimal.js normalizes 10.50 to 10.5, so scale is 1
    const result = toDtoAmount(new Decimal('10.50'))
    expect(result).toEqual({ value: 105, scale: 1 })
  })
})
