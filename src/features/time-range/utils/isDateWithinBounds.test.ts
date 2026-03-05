import { describe, it, expect } from 'vitest'

import { isDateWithinBounds } from './isDateWithinBounds'

describe('isDateWithinBounds', () => {
  const bounds = { from: '2024-01-10', to: '2024-01-20' }

  it('returns true when date is inside range', () => {
    expect(isDateWithinBounds('2024-01-15', bounds)).toBe(true)
    expect(isDateWithinBounds('2024-01-12', bounds)).toBe(true)
  })

  it('returns true when date equals from (inclusive)', () => {
    expect(isDateWithinBounds('2024-01-10', bounds)).toBe(true)
  })

  it('returns true when date equals to (inclusive)', () => {
    expect(isDateWithinBounds('2024-01-20', bounds)).toBe(true)
  })

  it('returns false when date is before from', () => {
    expect(isDateWithinBounds('2024-01-09', bounds)).toBe(false)
    expect(isDateWithinBounds('2024-01-01', bounds)).toBe(false)
  })

  it('returns false when date is after to', () => {
    expect(isDateWithinBounds('2024-01-21', bounds)).toBe(false)
    expect(isDateWithinBounds('2024-02-01', bounds)).toBe(false)
  })

  it('returns false when bounds are missing', () => {
    expect(isDateWithinBounds('2024-01-15', {})).toBe(false)
    expect(isDateWithinBounds('2024-01-15', { from: '2024-01-10' })).toBe(false)
    expect(isDateWithinBounds('2024-01-15', { to: '2024-01-20' })).toBe(false)
  })

  it('returns false for invalid date', () => {
    expect(isDateWithinBounds('invalid', bounds)).toBe(false)
    expect(isDateWithinBounds('2024-13-01', bounds)).toBe(false)
    expect(isDateWithinBounds('2024-02-30', bounds)).toBe(false)
  })

  it('returns false when bounds contain invalid date', () => {
    expect(isDateWithinBounds('2024-01-15', { from: 'invalid', to: '2024-01-20' })).toBe(false)
    expect(isDateWithinBounds('2024-01-15', { from: '2024-01-10', to: 'invalid' })).toBe(false)
  })

  it('rejects non-YYYY-MM-DD date string that dayjs parses differently', () => {
    // dayjs may still parse some formats; invalid month/day fails
    expect(isDateWithinBounds('2024-00-01', bounds)).toBe(false)
    expect(isDateWithinBounds('2024-13-45', bounds)).toBe(false)
  })
})
