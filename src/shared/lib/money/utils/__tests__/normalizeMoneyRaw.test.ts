import { describe, it, expect } from 'vitest'

import { normalizeMoneyRaw } from '../normalizeMoneyRaw'

describe('normalizeMoneyRaw', () => {
  it('returns the same raw when scales match', () => {
    expect(normalizeMoneyRaw(10000, 2, 2)).toBe(10000)
  })

  it('upscales whole units to minor units', () => {
    // "100" parsed as raw=100, scale=0 → currency scale 2
    expect(normalizeMoneyRaw(100, 0, 2)).toBe(10000)
  })

  it('downscales minor units to whole units', () => {
    expect(normalizeMoneyRaw(10000, 2, 0)).toBe(100)
  })

  it('handles intermediate fractional scales', () => {
    // 99.5 at scale 1 → scale 2
    expect(normalizeMoneyRaw(995, 1, 2)).toBe(9950)
  })
})
