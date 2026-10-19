import { MultiplicationSignIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { type FC, useRef } from 'react'
import { Decimal } from 'decimal.js'

import { selectCurrency } from '@/entities/settings'
import { useAppSelector } from '@/app/store/hooks'
import { cn } from '@/shared/lib'
import { FieldError, Field, FieldLabel } from '@/shared/ui/field'
import { Button } from '@/shared/ui/button'
import type { InputProps } from '@/shared/ui/input'

import { formatThousands } from '@/shared/lib/money/utils/formatThousands'

import { MoneyInput } from './MoneyInput'

type Props = Omit<InputProps, 'onChange'> & {
  isError?: boolean
  currency?: string
  errorMessage?: string
  className?: string
  label?: string
  inputProps: {
    value: string
    onChange: (value: string) => void
  }
}

const PRESET_MULTIPLIERS = [1000, 10000, 100000]

function getBaseAmount(value: string): Decimal {
  const parsed = parseFloat(value)

  if (Number.isNaN(parsed) || parsed === 0) {
    return new Decimal(1)
  }

  return new Decimal(value)
}

function getMultipliedAmount(value: string, multiplier: number): string {
  return getBaseAmount(value).mul(multiplier).toFixed()
}

function formatPresetAmount(value: string, multiplier: number): string {
  return formatThousands(getMultipliedAmount(value, multiplier))
}

export const MoneyField: FC<Props> = ({
  inputProps,
  isError,
  currency,
  errorMessage,
  className,
  label,
}) => {
  const ref = useRef<HTMLInputElement>(null)
  const defaultCurrency = useAppSelector(selectCurrency)
  const handleMultiply = (multiplier: number) => {
    inputProps.onChange(getMultipliedAmount(inputProps.value, multiplier))
    ref.current?.focus()
  }

  const handleClear = () => {
    inputProps.onChange('')
    ref.current?.focus()
  }

  return (
    <Field className={cn('flex flex-col gap-2', className)}>
      {label && <FieldLabel>{label}</FieldLabel>}
      <div className="relative">
        <MoneyInput {...inputProps} isError={isError} ref={ref} />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {inputProps.value.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className=" text-destructive"
              onClick={handleClear}
            >
              <HugeiconsIcon icon={MultiplicationSignIcon} size={20} />
            </Button>
          )}
          <p className="text-primary text-lg">
            {currency ?? defaultCurrency.code}
          </p>
        </div>
      </div>
      {!inputProps.value.includes('.') && (
        <div className="flex flex-wrap gap-1">
          {PRESET_MULTIPLIERS.map((multiplier) => (
            <Button
              variant="outline"
              size="xs"
              className="px-3 h-7 rounded-lg"
              key={multiplier}
              onClick={() => handleMultiply(multiplier)}
              type="button"
            >
              {formatPresetAmount(inputProps.value, multiplier)}
            </Button>
          ))}
        </div>
      )}
      {isError && <FieldError>{errorMessage}</FieldError>}
    </Field>
  )
}
