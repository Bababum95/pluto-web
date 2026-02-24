import type { FC } from 'react'

import { Input, type InputProps } from '@/components/ui/input'
import { cn } from '@/lib/utils'

import { sanitizeDecimal } from '../utils/sanitizeDecimal'

type Props = Omit<InputProps, 'onChange'> & {
  value: string
  onChange: (value: string) => void
  isError?: boolean
}

export const MoneyInput: FC<Props> = ({
  value,
  onChange,
  isError,
  ...props
}) => {
  return (
    <Input
      {...props}
      placeholder={props.placeholder ?? '0'}
      type="text"
      inputMode="decimal"
      value={value}
      className={cn(props.className, isError ? 'border-destructive' : '')}
      onChange={(e) => {
        onChange(sanitizeDecimal(e.target.value))
      }}
    />
  )
}
