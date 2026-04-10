import { forwardRef, useCallback, useMemo } from 'react'

import { Input, type InputProps } from '@/components/ui/input'
import { cn } from '@/lib/utils'

import { sanitizeDecimal } from '../utils/sanitizeDecimal'

type Props = Omit<InputProps, 'onChange'> & {
  value: string
  onChange: (value: string) => void
  isError?: boolean
}

function formatThousands(value: string): string {
  const [integerPart, fractionPart] = value.split('.')
  const formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')

  return fractionPart === undefined
    ? formattedIntegerPart
    : `${formattedIntegerPart}.${fractionPart}`
}

export const MoneyInput = forwardRef<HTMLInputElement, Props>(
  ({ value, onChange, isError, ...props }, ref) => {
    const displayValue = useMemo(() => formatThousands(value), [value])

    const handleChange: NonNullable<InputProps['onChange']> = useCallback(
      (e) => {
        onChange(sanitizeDecimal(e.target.value))
      },
      [onChange]
    )

    return (
      <Input
        {...props}
        ref={ref}
        placeholder={props.placeholder ?? '0'}
        type="text"
        inputMode="decimal"
        value={displayValue}
        className={cn(props.className, isError ? 'border-destructive' : '')}
        onChange={handleChange}
      />
    )
  }
)

MoneyInput.displayName = 'MoneyInput'
