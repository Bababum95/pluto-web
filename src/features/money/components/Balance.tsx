import type { FC } from 'react'

import { formatBalance } from '../utils/formatBalance'
import type { FormatBalanceParams } from '../types'
import { cn } from '@/lib/utils'

type Props = FormatBalanceParams & {
  className?: string
}

export const Balance: FC<Props> = ({ balance, scale, currency, className }) => {
  return (
    <span className={cn('font-medium', className)}>
      {formatBalance({ balance, scale, currency })}
    </span>
  )
}
