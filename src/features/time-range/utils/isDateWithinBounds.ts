import dayjs from '@/lib/dayjs'

import { DATE_FORMAT } from '../constants'

/**
 * Checks whether a date string (YYYY-MM-DD) is inside inclusive bounds.
 * Bounds must also be in YYYY-MM-DD format.
 * Returns false if bounds are not provided.
 */
export function isDateWithinBounds(
  date: string,
  bounds: { from?: string; to?: string }
): boolean {
  const { from, to } = bounds

  if (!from || !to) return false

  // Parse using strict format to avoid timezone shifts
  const target = dayjs(date, DATE_FORMAT, true)
  const start = dayjs(from, DATE_FORMAT, true)
  const end = dayjs(to, DATE_FORMAT, true)

  if (!target.isValid() || !start.isValid() || !end.isValid()) {
    return false
  }

  // Compare by date only (no time component)
  return (
    (target.isSame(start, 'day') || target.isAfter(start, 'day')) &&
    (target.isSame(end, 'day') || target.isBefore(end, 'day'))
  )
}
