import type { FC } from 'react'

import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

import { sanitizeDecimal } from '../utils/sanitizeDecimal'

type Props = {
  value: string
  onChange: (value: string) => void
  isError?: boolean
}

export const MoneyInput: FC<Props> = ({ value, onChange, isError }) => {
  return (
    <Input
      autoFocus
      placeholder="0"
      type="text"
      inputMode="decimal"
      value={value}
      className={cn(isError ? 'border-destructive' : '')}
      onChange={(e) => {
        onChange(sanitizeDecimal(e.target.value))
      }}
    />
  )
}
