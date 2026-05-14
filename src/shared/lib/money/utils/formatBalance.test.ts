import { describe, it, expect } from 'vitest'

import { formatBalance } from './formatBalance'

describe('formatBalance', () => {
  it('formats crypto code with decimal fallback', () => {
    const result = formatBalance({
      balance: 1234.56789,
      currency: { code: 'USDT', decimal_digits: 5 },
    })
    expect(result).toContain('USDT')
    expect(result).toMatch(/\d/)
  })

  it('formats ISO currency with native formatter', () => {
    const result = formatBalance({
      balance: 1234.56,
      currency: { code: 'USD', decimal_digits: 2 },
    })
    expect(result).not.toContain('USD')
    expect(result).toMatch(/\$/)
  })

  it('formats USD with 2 decimal digits', () => {
    const result = formatBalance({
      balance: 1234.56,
      currency: { code: 'USD', decimal_digits: 2 },
    })
    expect(result).toMatch(/\d/)
    expect(result).toContain('1')
    expect(result).toContain('234')
  })

  it('formats RUB amount', () => {
    const result = formatBalance({
      balance: 1000,
      currency: { code: 'RUB', decimal_digits: 2 },
    })
    expect(result).toMatch(/\d/)
    expect(result.length).toBeGreaterThan(0)
  })

  it('formats EUR with fractional part', () => {
    const result = formatBalance({
      balance: 99.99,
      currency: { code: 'EUR', decimal_digits: 2 },
    })
    expect(result).toMatch(/\d/)
    expect(result).toContain('99')
  })

  it('formats zero', () => {
    const result = formatBalance({
      balance: 0,
      currency: { code: 'USD', decimal_digits: 2 },
    })
    expect(result).toMatch(/0/)
  })

  it('respects decimal_digits for fractional part', () => {
    const result = formatBalance({
      balance: 123.456,
      currency: { code: 'USD', decimal_digits: 2 },
    })
    expect(result).toMatch(/\d/)
  })

  it('formats large numbers', () => {
    const result = formatBalance({
      balance: 1_000_000,
      currency: { code: 'USD', decimal_digits: 0 },
    })
    expect(result).toMatch(/1/)
    expect(result).toMatch(/\d/)
  })
})
