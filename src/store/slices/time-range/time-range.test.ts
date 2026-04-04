import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import timeRangeReducer, {
  setTimeRange,
  setTimeRangeIndex,
  decreaseTimeRangeIndex,
  increaseTimeRangeIndex,
} from './index'
import { getTimeRangeBounds } from '@/features/time-range/utils/getTimeRangeBounds'

describe('timeRange slice', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-06-15T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('initial state uses default type, index 0, and same-day ISO range', () => {
    const state = timeRangeReducer(undefined, { type: '@@INIT' })
    expect(state.type).toBe('day')
    expect(state.index).toBe(0)
    expect(state.range.from).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(state.range.to).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(state.range.from).toBe(state.range.to)
  })

  it('setTimeRange with type recomputes range and resets index to 0 when index omitted', () => {
    let state = timeRangeReducer(
      undefined,
      setTimeRange({ type: 'month', index: 2 })
    )
    state = timeRangeReducer(state, setTimeRange({ type: 'week' }))
    expect(state.type).toBe('week')
    expect(state.index).toBe(0)
    expect(state.range).toEqual(getTimeRangeBounds('week', 0))
  })

  it('setTimeRange with period keeps or sets custom range', () => {
    const custom = { from: '2024-01-01', to: '2024-01-31' }
    const state = timeRangeReducer(
      undefined,
      setTimeRange({ type: 'period', index: 0, range: custom })
    )
    expect(state.type).toBe('period')
    expect(state.range).toEqual(custom)
  })

  it('setTimeRange switching to period without range keeps previous range', () => {
    let state = timeRangeReducer(undefined, setTimeRange({ type: 'day', index: 0 }))
    const previous = state.range
    state = timeRangeReducer(state, setTimeRange({ type: 'period' }))
    expect(state.type).toBe('period')
    expect(state.range).toEqual(previous)
  })

  it('setTimeRangeIndex updates range for non-period types', () => {
    let state = timeRangeReducer(undefined, setTimeRange({ type: 'day', index: 0 }))
    state = timeRangeReducer(state, setTimeRangeIndex(3))
    expect(state.index).toBe(3)
    expect(state.range).toEqual(getTimeRangeBounds('day', 3))
  })

  it('setTimeRangeIndex does not recompute range for period', () => {
    const custom = { from: '2024-02-01', to: '2024-02-28' }
    let state = timeRangeReducer(
      undefined,
      setTimeRange({ type: 'period', range: custom })
    )
    state = timeRangeReducer(state, setTimeRangeIndex(5))
    expect(state.index).toBe(5)
    expect(state.range).toEqual(custom)
  })

  it('decreaseTimeRangeIndex clamps at 0 and updates range', () => {
    let state = timeRangeReducer(undefined, setTimeRange({ type: 'week', index: 1 }))
    state = timeRangeReducer(state, decreaseTimeRangeIndex())
    expect(state.index).toBe(0)
    expect(state.range).toEqual(getTimeRangeBounds('week', 0))
    state = timeRangeReducer(state, decreaseTimeRangeIndex())
    expect(state.index).toBe(0)
  })

  it('increaseTimeRangeIndex increments index and range', () => {
    let state = timeRangeReducer(undefined, setTimeRange({ type: 'month', index: 0 }))
    state = timeRangeReducer(state, increaseTimeRangeIndex())
    expect(state.index).toBe(1)
    expect(state.range).toEqual(getTimeRangeBounds('month', 1))
  })
})
