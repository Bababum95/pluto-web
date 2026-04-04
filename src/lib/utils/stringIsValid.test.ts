import { describe, it, expect } from 'vitest'

import { stringIsValid } from './stringIsValid'

describe('stringIsValid', () => {
  it('returns true for non-empty trimmed string', () => {
    expect(stringIsValid('a')).toBe(true)
    expect(stringIsValid(' hello ')).toBe(true)
  })

  it('returns false for undefined', () => {
    expect(stringIsValid(undefined)).toBe(false)
  })

  it('returns false for empty or whitespace-only string', () => {
    expect(stringIsValid('')).toBe(false)
    expect(stringIsValid('   ')).toBe(false)
    expect(stringIsValid('\t\n')).toBe(false)
  })

  it('returns false for non-string values', () => {
    expect(stringIsValid(null)).toBe(false)
    expect(stringIsValid(0)).toBe(false)
    expect(stringIsValid({})).toBe(false)
  })
})
