import type { FC } from 'react'

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

export const MoneyField: FC<Props> = ({
  inputProps,
  isError,
  currency,
  errorMessage,
  className,
  label,
}) => {
  const defaultCurrency = useAppSelector(selectCurrency)

  return (
    <Field className={cn('flex flex-col gap-2', className)}>
      {label && <FieldLabel>{label}</FieldLabel>}
      <ButtonGroup className="w-full">
        <MoneyInput {...inputProps} isError={isError} />
        <Button
          variant="secondary"
          type="button"
          className={cn('min-w-24', isError && 'border-destructive')}
        >
          {currency ?? defaultCurrency.code}
        </Button>
      </ButtonGroup>
      {isError && <FieldError>{errorMessage}</FieldError>}
    </Field>
  )
}
