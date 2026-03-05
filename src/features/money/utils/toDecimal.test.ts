import { describe, it, expect } from 'vitest'

import { toDecimal, toDecimalString } from './toDecimal'

describe('toDecimal', () => {
  it('returns number with scale 0 (integer)', () => {
    expect(toDecimal(100, 0)).toBe(100)
    expect(toDecimal(12345, 0)).toBe(12345)
  })

  it('returns number with scale 2', () => {
    expect(toDecimal(12345, 2)).toBe(123.45)
    expect(toDecimal(100, 2)).toBe(1)
  })

  it('returns number with scale 4', () => {
    expect(toDecimal(123456, 4)).toBe(12.3456)
    expect(toDecimal(1, 4)).toBe(0.0001)
  })

  it('returns 0 when balance is 0', () => {
    expect(toDecimal(0, 0)).toBe(0)
    expect(toDecimal(0, 2)).toBe(0)
    expect(toDecimal(0, 4)).toBe(0)
  })

  it('handles large numbers', () => {
    expect(toDecimal(1_000_000_00, 2)).toBe(1_000_000)
    expect(toDecimal(99999999, 2)).toBe(999999.99)
  })
})

describe('toDecimalString', () => {
  it('returns string with scale 0', () => {
    expect(toDecimalString(100, 0)).toBe('100')
    expect(toDecimalString(12345, 0)).toBe('12345')
  })

  it('returns string with scale 2', () => {
    expect(toDecimalString(12345, 2)).toBe('123.45')
    expect(toDecimalString(100, 2)).toBe('1.00')
  })

  it('returns string with scale 4', () => {
    expect(toDecimalString(123456, 4)).toBe('12.3456')
    expect(toDecimalString(1, 4)).toBe('0.0001')
  })

  it('returns "0.00" when balance is 0 and scale 2', () => {
    expect(toDecimalString(0, 0)).toBe('0')
    expect(toDecimalString(0, 2)).toBe('0.00')
    expect(toDecimalString(0, 4)).toBe('0.0000')
  })

  it('pads fractional part to scale', () => {
    expect(toDecimalString(10, 2)).toBe('0.10')
    expect(toDecimalString(1, 2)).toBe('0.01')
  })
})
