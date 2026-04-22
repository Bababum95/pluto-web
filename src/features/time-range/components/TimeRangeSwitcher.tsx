import { HugeiconsIcon } from '@hugeicons/react'
import {
  ArrowRight01Icon,
  ArrowLeft01Icon,
  ArrowRightDoubleIcon,
} from '@hugeicons/core-free-icons'
import type { FC } from 'react'
import type { DateRange } from 'react-day-picker'

import dayjs from '@/lib/dayjs'
import {
  ToggleGroup,
  ToggleGroupItem,
} from '@/components/ui/toggle-group/toggle-group'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/i18n'
import { useAppDispatch, useAppSelector } from '@/store'
import {
  decreaseTimeRangeIndex,
  increaseTimeRangeIndex,
  setTimeRange,
  setTimeRangeIndex,
  selectTimeRangeState,
  type TimeRangeState,
} from '@/store/slices/time-range'
import { cn } from '@/lib/utils'
import { DatePickerRange } from '@/components/ui/date-picker-range'

import { DATE_FORMAT, TIME_RANGES } from '../constants'
import type { TimeRangeType } from '../types'

import { TimeRangeDateLabel } from './TimeRangeDateLabel'

export const TimeRangeSwitcher: FC = () => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const timeRange = useAppSelector(selectTimeRangeState)

  const isPeriod = timeRange.type === 'period'
  const canDecrease = timeRange.index > 0

  const actions = {
    set: (value: Partial<TimeRangeState>) => dispatch(setTimeRange(value)),
    setIndex: (value: number) => dispatch(setTimeRangeIndex(value)),
    next: () => dispatch(increaseTimeRangeIndex()),
    prev: () => dispatch(decreaseTimeRangeIndex()),
  }

  const handleTimeRangeTypeChange = (value: string) => {
    actions.set({ type: value as TimeRangeType })
  }

  const handleSetRange = (range: DateRange) => {
    actions.set({
      range: {
        from: dayjs(range.from).format(DATE_FORMAT),
        to: dayjs(range.to).format(DATE_FORMAT),
      },
    })
  }

  return (
    <div className="relative z-45 -mb-2">
      <ToggleGroup
        type="single"
        value={timeRange.type}
        onValueChange={(v) => v && handleTimeRangeTypeChange(v)}
        spacing={1}
        className="w-full border-border border p-0.5 rounded-3xl"
      >
        {TIME_RANGES.map((range) => (
          <ToggleGroupItem
            key={range}
            value={range}
            className="flex-1 text-base rounded-2xl"
          >
            {t(`timeRanges.${range}`)}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <div className="flex gap-2 items-center justify-between mt-2 w-full">
        {!isPeriod ? (
          <>
            <div className="w-18">
              <Button
                variant="ghost"
                size="icon"
                onClick={actions.next}
                className="[&_svg]:size-5"
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} />
              </Button>
            </div>

            <TimeRangeDateLabel
              timeRange={timeRange.type}
              timeRangeIndex={timeRange.index}
            />

            <div className="flex items-center w-18">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => actions.setIndex(0)}
                className={cn(
                  '[&_svg]:size-5',
                  !canDecrease && 'opacity-0 pointer-events-none'
                )}
              >
                <HugeiconsIcon icon={ArrowRightDoubleIcon} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="[&_svg]:size-5"
                disabled={!canDecrease}
                onClick={actions.prev}
              >
                <HugeiconsIcon icon={ArrowRight01Icon} />
              </Button>
            </div>
          </>
        ) : (
          <DatePickerRange
            onChange={handleSetRange}
            value={{
              from: dayjs(timeRange.range.from).toDate(),
              to: dayjs(timeRange.range.to).toDate(),
            }}
          />
        )}
      </div>
    </div>
  )
}
