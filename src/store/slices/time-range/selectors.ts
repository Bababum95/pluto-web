import dayjs from '@/lib/dayjs'
import { DATE_FORMAT } from '@/features/time-range/constants'
import type { RootState } from '@/store'

export const selectTimeRangeState = (state: RootState) => state.timeRange
export const selectTimeRangeType = (state: RootState) => state.timeRange.type
export const selectTimeRangeIndex = (state: RootState) => state.timeRange.index
export const selectTimeRangeValue = (state: RootState) => state.timeRange.range

export const selectTimeRangeFormatted = (state: RootState) => {
  const { range } = state.timeRange

  if (!range) return null

  const { from, to } = range

  return {
    from: dayjs(from).format(DATE_FORMAT),
    to: dayjs(to).format(DATE_FORMAT),
  }
}
