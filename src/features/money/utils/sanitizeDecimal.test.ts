import { describe, it, expect } from 'vitest'

import { sanitizeDecimal } from './sanitizeDecimal'

describe('sanitizeDecimal', () => {
  it('replaces comma with dot', () => {
    // Comma is replaced first, so "1,234.56" -> "1.234.56" (only first dot kept)
    expect(sanitizeDecimal('0,5')).toBe('0.5')
    expect(sanitizeDecimal(',5')).toBe('.5')
    expect(sanitizeDecimal('1234,56')).toBe('1234.56')
  })

  it('removes letters', () => {
    expect(sanitizeDecimal('12abc34')).toBe('1234')
    expect(sanitizeDecimal('abc')).toBe('')
    expect(sanitizeDecimal('1a2b3')).toBe('123')
  })

  it('removes special characters except dot', () => {
    expect(sanitizeDecimal('1 234.56')).toBe('1234.56')
    expect(sanitizeDecimal('1-234')).toBe('1234')
    expect(sanitizeDecimal('$100.00')).toBe('100.00')
    expect(sanitizeDecimal('100€')).toBe('100')
  })

  it('keeps only first dot when multiple dots present', () => {
    expect(sanitizeDecimal('1.2.3')).toBe('1.23')
    expect(sanitizeDecimal('12.34.56')).toBe('12.3456')
    expect(sanitizeDecimal('..5')).toBe('.5')
  })

  it('returns digits and single dot unchanged', () => {
    expect(sanitizeDecimal('123.45')).toBe('123.45')
    expect(sanitizeDecimal('0')).toBe('0')
    expect(sanitizeDecimal('999')).toBe('999')
  })

  it('returns empty string when only non-numeric chars', () => {
    expect(sanitizeDecimal('abc')).toBe('')
    expect(sanitizeDecimal('---')).toBe('')
  })
})
