import { forwardRef, useCallback, useMemo } from 'react'

import { Input, type InputProps } from '@/shared/ui/input'
import { cn } from '@/shared/lib'

import { formatThousands } from '@/shared/lib/money/utils/formatThousands'
import { sanitizeDecimal } from '@/shared/lib/money/utils/sanitizeDecimal'

type Props = Omit<InputProps, 'onChange'> & {
  value: string
  onChange: (value: string) => void
  isError?: boolean
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
