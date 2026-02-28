import Decimal from 'decimal.js'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import mockExchangeRates from '@/__mocks__/rates.json'
import { calculateTransferRate } from './calculateTransferRate'

vi.mock(
  '@/features/money',
  async () => await import('@/__mocks__/features/money')
)

const { calculateBaseRate } = await import('@/features/money')

describe('calculateTransferRate', () => {
  beforeEach(() => {
    vi.mocked(calculateBaseRate).mockClear()
    vi.mocked(calculateBaseRate).mockReturnValue(0.92)
  })

  it('returns base rate when from.value is null', () => {
    const result = calculateTransferRate({
      from: { value: null, code: 'USD' },
      to: { value: new Decimal(100), code: 'EUR' },
      fee: { type: 'percent' },
      rates: mockExchangeRates,
    })
    expect(calculateBaseRate).toHaveBeenCalledWith(
      mockExchangeRates,
      'USD',
      'EUR'
    )
    expect(result).toEqual(new Decimal(0.92))
  })

  it('returns base rate when to.value is null', () => {
    const result = calculateTransferRate({
      from: { value: new Decimal(100), code: 'USD' },
      to: { value: null, code: 'EUR' },
      fee: { type: 'percent' },
      rates: mockExchangeRates,
    })
    expect(calculateBaseRate).toHaveBeenCalledWith(
      mockExchangeRates,
      'USD',
      'EUR'
    )
    expect(result).toEqual(new Decimal(0.92))
  })

  it('returns null when base rate is not found and one amount is missing', () => {
    vi.mocked(calculateBaseRate).mockReturnValue(null)
    const result = calculateTransferRate({
      from: { value: null, code: 'USD' },
      to: { value: new Decimal(100), code: 'XXX' },
      fee: { type: 'percent' },
      rates: mockExchangeRates,
    })
    expect(result).toBeNull()
  })

  it('computes rate as to/from when both values present and no fee', () => {
    const result = calculateTransferRate({
      from: { value: new Decimal(100), code: 'USD' },
      to: { value: new Decimal(92), code: 'EUR' },
      fee: { type: 'percent' },
      rates: mockExchangeRates,
    })
    expect(calculateBaseRate).not.toHaveBeenCalled()
    expect(result?.toNumber()).toBe(0.92)
  })

  it('returns null when netFrom is zero', () => {
    const result = calculateTransferRate({
      from: { value: new Decimal(0), code: 'USD' },
      to: { value: new Decimal(92), code: 'EUR' },
      fee: { type: 'percent' },
      rates: mockExchangeRates,
    })
    expect(result).toBeNull()
  })

  it('applies percent fee: reduces from amount before computing rate', () => {
    // 100 USD - 5% = 95 USD; 92 EUR; rate = 92/95 ≈ 0.9684
    const result = calculateTransferRate({
      from: { value: new Decimal(100), code: 'USD' },
      to: { value: new Decimal(92), code: 'EUR' },
      fee: { value: new Decimal(5), type: 'percent' },
      rates: mockExchangeRates,
    })
    const expected = new Decimal(92).div(95)
    expect(result?.toFixed(6)).toBe(expected.toFixed(6))
  })

  it('applies from_currency fee: subtracts fee from from amount', () => {
    // 100 - 5 = 95; rate = 92/95
    const result = calculateTransferRate({
      from: { value: new Decimal(100), code: 'USD' },
      to: { value: new Decimal(92), code: 'EUR' },
      fee: { value: new Decimal(5), type: 'from_currency' },
      rates: mockExchangeRates,
    })
    const expected = new Decimal(92).div(95)
    expect(result?.toFixed(6)).toBe(expected.toFixed(6))
  })

  it('applies to_currency fee: adds fee to to amount', () => {
    // to becomes 92 + 3 = 95; rate = 95/100 = 0.95
    const result = calculateTransferRate({
      from: { value: new Decimal(100), code: 'USD' },
      to: { value: new Decimal(92), code: 'EUR' },
      fee: { value: new Decimal(3), type: 'to_currency' },
      rates: mockExchangeRates,
    })
    expect(result?.toNumber()).toBe(0.95)
  })

  it('ignores fee when fee.value is zero', () => {
    const result = calculateTransferRate({
      from: { value: new Decimal(100), code: 'USD' },
      to: { value: new Decimal(92), code: 'EUR' },
      fee: { value: new Decimal(0), type: 'percent' },
      rates: mockExchangeRates,
    })
    expect(result?.toNumber()).toBe(0.92)
  })

  it('ignores fee when fee.value is undefined', () => {
    const result = calculateTransferRate({
      from: { value: new Decimal(100), code: 'USD' },
      to: { value: new Decimal(92), code: 'EUR' },
      fee: { type: 'percent' },
      rates: mockExchangeRates,
    })
    expect(result?.toNumber()).toBe(0.92)
  })
})
