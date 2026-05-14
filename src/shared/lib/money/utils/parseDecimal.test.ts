import { describe, it, expect } from 'vitest'

import { parseDecimal } from './parseDecimal'

describe('parseDecimal', () => {
  it('parses integer string', () => {
    expect(parseDecimal('100')).toEqual({ balance: 100, scale: 0 })
    expect(parseDecimal('0')).toEqual({ balance: 0, scale: 0 })
    expect(parseDecimal('12345')).toEqual({ balance: 12345, scale: 0 })
  })

  it('parses decimal string with scale', () => {
    expect(parseDecimal('123.45')).toEqual({ balance: 12345, scale: 2 })
    expect(parseDecimal('1.5')).toEqual({ balance: 15, scale: 1 })
    expect(parseDecimal('0.01')).toEqual({ balance: 1, scale: 2 })
  })

  it('parses string with leading decimal point', () => {
    expect(parseDecimal('.5')).toEqual({ balance: 5, scale: 1 })
    expect(parseDecimal('.99')).toEqual({ balance: 99, scale: 2 })
  })

  it('parses empty string as zero', () => {
    expect(parseDecimal('')).toEqual({ balance: 0, scale: 0 })
  })

  it('parses string without fractional part', () => {
    expect(parseDecimal('42')).toEqual({ balance: 42, scale: 0 })
  })

  it('handles multiple decimal places', () => {
    expect(parseDecimal('1.234')).toEqual({ balance: 1234, scale: 3 })
    expect(parseDecimal('99.9999')).toEqual({ balance: 999999, scale: 4 })
  })
})
