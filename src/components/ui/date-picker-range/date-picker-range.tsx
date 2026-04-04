'use client'

import type { FC } from 'react'
import type { DateRange } from 'react-day-picker'

import dayjs from '@/lib/dayjs'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { DATE_FORMAT } from '@/features/time-range'

type Props = {
  value?: DateRange
  onChange: (value: DateRange) => void
}

export const DatePickerRange: FC<Props> = ({ value, onChange }) => (
  <Popover>
    <PopoverTrigger asChild>
      <Button
        id="date-picker-range"
        variant="secondary"
        size="sm"
        className="w-full rounded-lg"
      >
        {value?.from &&
          (value.to ? (
            <>
              {dayjs(value.from).format(DATE_FORMAT)}
              <span>-</span>
              {dayjs(value.to).format(DATE_FORMAT)}
            </>
          ) : (
            dayjs(value.from).format(DATE_FORMAT)
          ))}
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-auto p-0" align="center">
      <Calendar
        mode="range"
        defaultMonth={value?.from}
        selected={value}
        onSelect={onChange}
        numberOfMonths={1}
        required
      />
    </PopoverContent>
  </Popover>
)
