import type { FC } from 'react'

import { cn } from '@/shared/lib'
import { Skeleton } from '@/shared/ui/skeleton'
import { formatBalance } from '@/shared/lib/money/utils/formatBalance'
import { DEFAULT_CURRENCY } from '@/shared/lib/money/constants'
import type { FormatBalanceParams } from '@/shared/lib/money/types'

type Props = Partial<FormatBalanceParams> & {
  className?: string
  loading?: boolean
}

export const Balance: FC<Props> = ({
  balance,
  currency,
  className,
  loading,
}) => {
  if (loading) {
    return (
      <Skeleton className={cn('w-[70%] h-[1em] align-middle', className)} />
    )
  }

  return (
    <span className={cn('font-medium', className)}>
      {formatBalance({
        balance: balance ?? 0,
        currency: currency ?? DEFAULT_CURRENCY,
      })}
    </span>
  )
}
