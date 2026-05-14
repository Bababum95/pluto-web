'use client'

import { useCallback, useState, type FC } from 'react'
import { Calendar04Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

import dayjs from '@/shared/lib/date/dayjs'
import { Calendar } from '@/shared/ui/calendar'
import { Field, FieldError, FieldLabel } from '@/shared/ui/field'
import { Button } from '@/shared/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/ui/popover'
import { useTranslation } from '@/shared/lib/i18n'
import { cn } from '@/shared/lib'

const DATE_FORMAT = 'DD.MM.YYYY'
const PRESET_DAYS = [
  { label: 'yesterday', value: 1 },
  { label: 'today', value: 0 },
] as const

type DatePickerProps = {
  value?: Date
  onChange: (value?: Date) => void
  label?: string
  placeholder?: string
  className?: string
  isError?: boolean
  errorMessage?: string
}

export const DatePicker: FC<DatePickerProps> = ({
  value,
  onChange,
  label,
  className,
  isError,
  errorMessage,
  placeholder,
}) => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [month, setMonth] = useState<Date | undefined>()

  const handlePresetDay = useCallback(
    (days: number) => {
      onChange(dayjs().subtract(days, 'day').toDate())
      setOpen(false)
    },
    [onChange, setOpen]
  )

  return (
    <Field className={cn('w-full', className)}>
      {label && <FieldLabel htmlFor="date-picker">{label}</FieldLabel>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date-picker"
            variant="secondary"
            aria-label={t('datePicker.label')}
            className={cn(
              'justify-between active:scale-100',
              isError ? 'border-destructive text-destructive' : ''
            )}
          >
            <span
              className={cn(
                'text-base',
                value ? 'text-foreground' : 'text-muted-foreground'
              )}
            >
              {value
                ? dayjs(value).format(DATE_FORMAT)
                : (placeholder ?? t('datePicker.label'))}
            </span>
            <HugeiconsIcon icon={Calendar04Icon} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="end">
          <div>
            <Calendar
              mode="single"
              selected={value}
              month={month}
              onMonthChange={setMonth}
              weekStartsOn={1}
              fixedWeeks
              disabled={(date) => date > new Date()}
              onSelect={(selected) => {
                onChange(selected)
                setOpen(false)
              }}
            />
            <div className="flex justify-between border-t p-2 gap-2">
              {PRESET_DAYS.map((day) => (
                <Button
                  variant="outline"
                  size="xs"
                  className="flex-1"
                  onClick={() => handlePresetDay(day.value)}
                >
                  {t(`datePicker.${day.label}`)}
                </Button>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
      {isError && <FieldError>{errorMessage}</FieldError>}
    </Field>
  )
}
