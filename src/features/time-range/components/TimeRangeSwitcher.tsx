import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowRight01Icon, ArrowLeft01Icon } from '@hugeicons/core-free-icons'
import type { FC } from 'react'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { TIME_RANGES } from '../constants'
import { useTimeRange } from '../hooks/useTimeRange'
import type { TimeRangeType } from '../types'

import { TimeRangeDateLabel } from './TimeRangeDateLabel'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/i18n'

export const TimeRangeSwitcher: FC = () => {
  const {
    timeRange,
    onTimeRangeChange,
    timeRangeIndex,
    decreaseTimeRangeIndex,
    increaseTimeRangeIndex,
  } = useTimeRange()
  const { t } = useTranslation()

  return (
    <div>
      <Tabs
        value={timeRange}
        onValueChange={(value) => onTimeRangeChange(value as TimeRangeType)}
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
        {timeRange !== 'period' ? (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={increaseTimeRangeIndex}
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
              disabled={timeRangeIndex === 0}
              onClick={decreaseTimeRangeIndex}
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
