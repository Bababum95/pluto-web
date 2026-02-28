import Decimal from 'decimal.js'
import { describe, it, expect } from 'vitest'

import { normalizeFeeToFrom } from './normalizeFeeToFrom'

describe('normalizeFeeToFrom', () => {
  const from = new Decimal(100)
  const rate = new Decimal(2)

  it('returns fee as-is for from_currency', () => {
    const fee = new Decimal(5)
    const result = normalizeFeeToFrom(fee, from, rate, 'from_currency')
    expect(result.toNumber()).toBe(5)
  })

  it('converts percent to from_currency: from * fee / 100', () => {
    const fee = new Decimal(10)
    const result = normalizeFeeToFrom(fee, from, rate, 'percent')
    expect(result.toNumber()).toBe(10)
  })

  it('converts to_currency to from_currency: fee / rate', () => {
    const fee = new Decimal(20)
    const result = normalizeFeeToFrom(fee, from, rate, 'to_currency')
    expect(result.toNumber()).toBe(10)
  })
})
