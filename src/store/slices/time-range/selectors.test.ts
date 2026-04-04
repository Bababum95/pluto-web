import { describe, it, expect } from 'vitest'

import type { RootState } from '@/store'
import {
  selectTimeRangeState,
  selectTimeRangeType,
  selectTimeRangeIndex,
  selectTimeRangeValue,
  selectTimeRangeFormatted,
} from './selectors'

function timeRangeState(
  timeRange: RootState['timeRange']
): RootState {
  return { timeRange } as RootState
}

describe('time-range selectors', () => {
  const sample: RootState['timeRange'] = {
    type: 'month',
    index: 1,
    range: { from: '2024-05-01', to: '2024-05-31' },
  }

  it('selectTimeRangeState returns slice', () => {
    const s = timeRangeState(sample)
    expect(selectTimeRangeState(s)).toEqual(sample)
  })

  it('selectTimeRangeType returns type', () => {
    expect(selectTimeRangeType(timeRangeState(sample))).toBe('month')
  })

  it('selectTimeRangeIndex returns index', () => {
    expect(selectTimeRangeIndex(timeRangeState(sample))).toBe(1)
  })

  it('selectTimeRangeValue returns range', () => {
    expect(selectTimeRangeValue(timeRangeState(sample))).toEqual({
      from: '2024-05-01',
      to: '2024-05-31',
    })
  })

  it('selectTimeRangeFormatted returns YYYY-MM-DD strings', () => {
    expect(selectTimeRangeFormatted(timeRangeState(sample))).toEqual({
      from: '2024-05-01',
      to: '2024-05-31',
    })
  })

  it('selectTimeRangeFormatted returns null when range is missing', () => {
    const s = timeRangeState({
      type: 'day',
      index: 0,
      range: undefined as unknown as RootState['timeRange']['range'],
    })
    expect(selectTimeRangeFormatted(s)).toBeNull()
  })
})
