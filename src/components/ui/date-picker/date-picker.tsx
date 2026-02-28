'use client'

import { useState, type FC } from 'react'
import { Calendar04Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

import dayjs from '@/lib/dayjs'
import { Calendar } from '@/components/ui/calendar'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useTranslation } from '@/lib/i18n'
import { cn } from '@/lib/utils'

const DATE_FORMAT = 'DD.MM.YYYY'

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
              'justify-between',
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
          <Calendar
            mode="single"
            selected={value}
            month={month}
            onMonthChange={setMonth}
            onSelect={(selected) => {
              onChange(selected)
              setOpen(false)
            }}
          />
        </PopoverContent>
      </Popover>
      {isError && <FieldError>{errorMessage}</FieldError>}
    </Field>
  )
}
