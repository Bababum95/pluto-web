import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import { getTimeRangeBounds } from './getTimeRangeBounds'

const DATE_FORMAT_REGEX = /^\d{4}-\d{2}-\d{2}$/

describe('getTimeRangeBounds', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-06-15T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns from and to in YYYY-MM-DD format for day', () => {
    const result = getTimeRangeBounds('day', 0)
    expect(result).toHaveProperty('from')
    expect(result).toHaveProperty('to')
    expect(result.from).toMatch(DATE_FORMAT_REGEX)
    expect(result.to).toMatch(DATE_FORMAT_REGEX)
    expect(result.from).toBe(result.to)
    expect(result.from).toBe('2024-06-15')
  })

  it('returns previous day for day with index 1', () => {
    const result = getTimeRangeBounds('day', 1)
    expect(result.from).toBe('2024-06-14')
    expect(result.to).toBe('2024-06-14')
  })

  it('returns week bounds in YYYY-MM-DD for week index 0', () => {
    const result = getTimeRangeBounds('week', 0)
    expect(result.from).toMatch(DATE_FORMAT_REGEX)
    expect(result.to).toMatch(DATE_FORMAT_REGEX)
    expect(result.from).toBe('2024-06-10')
    expect(result.to).toBe('2024-06-16')
  })

  it('returns previous week for week index 1', () => {
    const result = getTimeRangeBounds('week', 1)
    expect(result.from).toBe('2024-06-03')
    expect(result.to).toBe('2024-06-09')
  })

  it('returns month bounds for month index 0', () => {
    const result = getTimeRangeBounds('month', 0)
    expect(result.from).toBe('2024-06-01')
    expect(result.to).toBe('2024-06-30')
  })

  it('returns previous month for month index 1', () => {
    const result = getTimeRangeBounds('month', 1)
    expect(result.from).toBe('2024-05-01')
    expect(result.to).toBe('2024-05-31')
  })

  it('returns year bounds for year index 0', () => {
    const result = getTimeRangeBounds('year', 0)
    expect(result.from).toBe('2024-01-01')
    expect(result.to).toBe('2024-12-31')
  })

  it('returns previous year for year index 1', () => {
    const result = getTimeRangeBounds('year', 1)
    expect(result.from).toBe('2023-01-01')
    expect(result.to).toBe('2023-12-31')
  })

  it('always returns from <= to lexicographically', () => {
    for (const range of ['day', 'week', 'month', 'year'] as const) {
      const result = getTimeRangeBounds(range, 0)
      expect(result.from! <= result.to!).toBe(true)
    }
  })
})
