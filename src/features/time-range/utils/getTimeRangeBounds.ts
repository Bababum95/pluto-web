import dayjs from '@/lib/dayjs'

import type { TimeRangeType } from '../types'

/**
 * Computes inclusive date bounds [from, to] for the given time range and index.
 * Used for API filters and consistent with TimeRangeDateLabel display logic.
 * For 'period' returns no bounds (caller may omit from/to or use custom range later).
 * Bounds are returned as ISO datetimes to preserve timezone-aware period edges.
 */
export function getTimeRangeBounds(
  timeRange: TimeRangeType,
  timeRangeIndex: number
): { from: string; to: string } | { from?: undefined; to?: undefined } {
  const toIsoBounds = (start: dayjs.Dayjs, end: dayjs.Dayjs) => ({
    from: start.toISOString(),
    to: end.toISOString(),
  })

  if (timeRange === 'period') {
    return {}
  }

  if (timeRange === 'week') {
    const start = dayjs()
      .subtract(timeRangeIndex, 'week')
      .startOf('isoWeek')
    const end = start.endOf('isoWeek')
    return toIsoBounds(start, end)
  }

  if (timeRange === 'month') {
    const start = dayjs().subtract(timeRangeIndex, 'month').startOf('month')
    const end = start.endOf('month')
    return toIsoBounds(start, end)
  }

  if (timeRange === 'year') {
    const start = dayjs().subtract(timeRangeIndex, 'year').startOf('year')
    const end = start.endOf('year')
    return toIsoBounds(start, end)
  }

  // day
  const start = dayjs().subtract(timeRangeIndex, 'day').startOf('day')
  const end = start.endOf('day')
  return toIsoBounds(start, end)
}
