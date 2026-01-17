import type { FC } from 'react'

import dayjs from '@/lib/dayjs'
import { useTranslation } from '@/lib/i18n'

import type { TimeRangeType } from '../types'

type Props = {
  timeRange: Exclude<TimeRangeType, 'period'>
  timeRangeIndex: number
}

export const TimeRangeDateLabel: FC<Props> = ({
  timeRange,
  timeRangeIndex,
}) => {
  const { i18n } = useTranslation()

  if (timeRange === 'week') {
    const start = dayjs().subtract(timeRangeIndex, 'week').startOf('isoWeek')
    const end = start.endOf('isoWeek')

    return (
      <span className="text-sm font-medium">
        {start.locale(i18n.language).format('DD MMM')}
        {' – '}
        {end.locale(i18n.language).format('DD MMM')}
      </span>
    )
  }

  if (timeRange === 'month') {
    return (
      <span className="text-sm font-medium">
        {dayjs()
          .subtract(timeRangeIndex, 'month')
          .locale(i18n.language)
          .format('MMMM YYYY')}
      </span>
    )
  }

  if (timeRange === 'year') {
    return (
      <span className="text-sm font-medium">
        {dayjs().subtract(timeRangeIndex, 'year').format('YYYY')}
      </span>
    )
  }

  return (
    <span className="text-sm font-medium">
      {dayjs()
        .subtract(timeRangeIndex, timeRange)
        .locale(i18n.language)
        .format('DD MMMM')}
    </span>
  )
}
