import dayjs from '@/lib/dayjs'

import { DATE_FORMAT } from '../constants'
import type { TimeRangeType } from '../types'

/**
 * Computes inclusive date bounds [from, to] for the given time range and index.
 * Bounds are returned as ISO date strings (YYYY-MM-DD) without time and without timezone.
 */
export function getTimeRangeBounds(
  timeRange: Exclude<TimeRangeType, 'period'>,
  timeRangeIndex: number
): { from: string; to: string } {
  const toDateBounds = (start: dayjs.Dayjs, end: dayjs.Dayjs) => {
    const bounds = {
      from: start.format(DATE_FORMAT),
      to: end.format(DATE_FORMAT),
    }

    return bounds
  }

  if (timeRange === 'week') {
    const start = dayjs().subtract(timeRangeIndex, 'week').startOf('isoWeek')
    const end = start.endOf('isoWeek')
    return toDateBounds(start, end)
  }

  if (timeRange === 'month') {
    const start = dayjs().subtract(timeRangeIndex, 'month').startOf('month')
    const end = start.endOf('month')
    return toDateBounds(start, end)
  }

  if (timeRange === 'year') {
    const start = dayjs().subtract(timeRangeIndex, 'year').startOf('year')
    const end = start.endOf('year')
    return toDateBounds(start, end)
  }

  // day
  const start = dayjs().subtract(timeRangeIndex, 'day').startOf('day')
  const end = start.endOf('day')
  return toDateBounds(start, end)
}
