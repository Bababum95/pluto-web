import { useState, type FC } from 'react'

import { TimeRangeContext } from '../TimeRangeContext'
import { DEFAULT_TIME_RANGE } from '../constants'
import type { TimeRangeType } from '../types'

type Props = {
  children: React.ReactNode
}

export const TimeRangeProvider: FC<Props> = ({ children }) => {
  const [timeRange, setTimeRange] = useState<TimeRangeType>(DEFAULT_TIME_RANGE)
  const [timeRangeIndex, setTimeRangeIndex] = useState<number>(0)

  return (
    <TimeRangeContext.Provider
      value={{
        timeRange,
        onTimeRangeChange: setTimeRange,
        timeRangeIndex,
        onTimeRangeIndexChange: setTimeRangeIndex,
        decreaseTimeRangeIndex: () =>
          setTimeRangeIndex(Math.max(0, timeRangeIndex - 1)),
        increaseTimeRangeIndex: () => setTimeRangeIndex(timeRangeIndex + 1),
      }}
    >
      {children}
    </TimeRangeContext.Provider>
  )
}
