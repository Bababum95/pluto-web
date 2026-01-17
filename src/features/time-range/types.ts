import type { TIME_RANGES } from './constants'

export type TimeRangeType = (typeof TIME_RANGES)[number]

export type TimeRangeContextType = {
  timeRange: TimeRangeType
  onTimeRangeChange: (timeRange: TimeRangeType) => void
  timeRangeIndex: number
  onTimeRangeIndexChange: (timeRangeIndex: number) => void
  decreaseTimeRangeIndex: () => void
  increaseTimeRangeIndex: () => void
}
