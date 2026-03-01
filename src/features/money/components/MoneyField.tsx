import type { FC } from 'react'
import {
  Cancel01Icon,
  MultiplicationSignIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

import { selectCurrency } from '@/store/slices/settings'
import { useAppSelector } from '@/store/hooks'
import { cn } from '@/lib/utils'
import { FieldError, Field, FieldLabel } from '@/components/ui/field'
import { ButtonGroup } from '@/components/ui/button-group'
import { Button } from '@/components/ui/button'
import type { InputProps } from '@/components/ui/input'

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

const PRESET_MULTIPLIERS = [100, 1000, 10000, 100000, 1000000]

export const MoneyField: FC<Props> = ({
  inputProps,
  isError,
  currency,
  errorMessage,
  className,
  label,
}) => {
  const defaultCurrency = useAppSelector(selectCurrency)
  const handleMultiply = (multiplier: number) => {
    let currentValue = parseFloat(inputProps.value)
    if (Number.isNaN(currentValue) || currentValue === 0) {
      currentValue = 1
    }

    inputProps.onChange((currentValue * multiplier).toString())
  }

  return (
    <Field className={cn('flex flex-col gap-2', className)}>
      {label && <FieldLabel>{label}</FieldLabel>}
      <ButtonGroup className="w-full">
        <MoneyInput {...inputProps} isError={isError} />
        <Button
          variant="secondary"
          type="button"
          className={cn('', isError && 'border-destructive')}
          onClick={() => inputProps.onChange('')}
        >
          <HugeiconsIcon icon={Cancel01Icon} size={20} />
        </Button>
        <Button
          variant="secondary"
          type="button"
          className={cn('min-w-24', isError && 'border-destructive')}
        >
          {currency ?? defaultCurrency.code}
        </Button>
      </ButtonGroup>
      <div className="flex flex-wrap gap-1">
        <span className="text-muted-foreground h-7 flex items-center mr-2">
          <HugeiconsIcon icon={MultiplicationSignIcon} size={16} />
        </span>
        {PRESET_MULTIPLIERS.map((multiplier) => (
          <Button
            variant="outline"
            size="xs"
            className="px-3 h-7 rounded-lg"
            key={multiplier}
            onClick={() => handleMultiply(multiplier)}
            type="button"
          >
            {multiplier.toLocaleString()}
          </Button>
        ))}
      </div>
      {isError && <FieldError>{errorMessage}</FieldError>}
    </Field>
  )
}
