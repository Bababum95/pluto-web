import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowRight01Icon, ArrowLeft01Icon } from '@hugeicons/core-free-icons'
import type { FC } from 'react'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { TIME_RANGES } from '../constants'
import type { TimeRangeType } from '../types'

import { TimeRangeDateLabel } from './TimeRangeDateLabel'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/i18n'
import { useAppDispatch, useAppSelector } from '@/store'
import {
  decreaseTimeRangeIndex,
  increaseTimeRangeIndex,
  setTimeRange,
} from '@/store/slices/time-range'

export const TimeRangeSwitcher: FC = () => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { timeRange, timeRangeIndex } = useAppSelector(
    (state) => state.timeRange
  )

  const isPeriod = timeRange === 'period'
  const canDecrease = timeRangeIndex > 0

  const actions = {
    set: (value: TimeRangeType) => dispatch(setTimeRange(value)),
    next: () => dispatch(increaseTimeRangeIndex()),
    prev: () => dispatch(decreaseTimeRangeIndex()),
  }

  const handleTimeRangeChange = (value: TimeRangeType) => {
    actions.set(value)
  }

  return (
    <div>
      <Tabs
        value={timeRange}
        onValueChange={(value) => handleTimeRangeChange(value as TimeRangeType)}
        className="items-center w-full"
      >
        <TabsList className="w-full">
          {TIME_RANGES.map((range) => (
            <TabsTrigger key={range} value={range} className="flex-1">
              {t(`timeRanges.${range}`)}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <div className="flex gap-2 items-center justify-between">
        {!isPeriod ? (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={actions.next}
              className="[&_svg]:size-5"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} />
            </Button>

            <TimeRangeDateLabel
              timeRange={timeRange}
              timeRangeIndex={timeRangeIndex}
            />

            <Button
              variant="ghost"
              size="icon"
              className="[&_svg]:size-5"
              disabled={!canDecrease}
              onClick={actions.prev}
            >
              <HugeiconsIcon icon={ArrowRight01Icon} />
            </Button>
          </>
        ) : (
          <span className="text-sm font-medium">
            {t(`timeRanges.${timeRange}`)}
          </span>
        )}
      </div>
    </div>
  )
}
