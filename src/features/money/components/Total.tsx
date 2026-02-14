import { useTranslation } from 'react-i18next'
import { cva, type VariantProps } from 'class-variance-authority'
import type { FC } from 'react'

import {
  selectAccountsStatus,
  selectAccountsSummary,
} from '@/store/slices/account'
import { useAppSelector } from '@/store'

import { Balance } from './Balance'

const balanceVariants = cva('text-2xl', {
  variants: {
    size: {
      sm: 'text-lg',
      md: 'text-xl',
      lg: 'text-4xl font-bold',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

const labelVariants = cva('text-sm', {
  variants: {
    size: {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

type Props = VariantProps<typeof balanceVariants> & {
  className?: string
}

export const Total: FC<Props> = ({ size, className }) => {
  const { t } = useTranslation()
  const summary = useAppSelector(selectAccountsSummary)
  const status = useAppSelector(selectAccountsStatus)

  return (
    <div className={className}>
      <div className={labelVariants({ size })}>{t('common.total')}:</div>
      <Balance
        loading={status === 'pending'}
        balance={summary?.total}
        currency={summary?.currency}
        className={balanceVariants({ size })}
      />
    </div>
  )
}
