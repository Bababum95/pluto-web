import type { FC } from 'react'
import { ArrowDown02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

import { Icon } from '@/components/ui/icon'
import { Separator } from '@/components/ui/separator'
import { useAppSelector } from '@/store'
import { selectAccountById } from '@/store/slices/account'
import { Balance, toDecimal } from '@/features/money'

import type { Transfer } from '../types'

type Props = Transfer & {
  onClick?: () => void
  separator?: boolean
}

type AccountProps = {
  icon?: string
  color?: string
  name: string
}

const Account: FC<AccountProps> = ({ icon, color, name }) => (
  <div className="flex items-center gap-2">
    <Icon name={icon} color={color} size={16} className="p-1" />
    <span>{name}</span>
  </div>
)

export const TransferItem: FC<Props> = ({
  from,
  to,
  rate,
  onClick,
  separator = false,
}) => {
  const fromAccount = useAppSelector((state) =>
    selectAccountById(state, from.account)
  )
  const toAccount = useAppSelector((state) =>
    selectAccountById(state, to.account)
  )

  const fromName = fromAccount?.name ?? from.account
  const toName = toAccount?.name ?? to.account

  const fromCurrency = fromAccount?.balance.original.currency
  const toCurrency = toAccount?.balance.original.currency

  return (
    <>
      <div className="flex items-center gap-2 p-2 pr-3 pl-1" onClick={onClick}>
        <HugeiconsIcon icon={ArrowDown02Icon} size={24} />
        <div className="flex flex-col gap-3">
          <Account
            icon={fromAccount?.icon}
            color={fromAccount?.color}
            name={fromName}
          />
          <Account
            icon={toAccount?.icon}
            color={toAccount?.color}
            name={toName}
          />
        </div>
        <div className="flex flex-col gap-1 ml-auto items-end">
          <Balance
            balance={toDecimal(from.value, from.scale)}
            currency={fromCurrency}
          />
          <span className="text-xs text-muted-foreground">
            {'1 X '}
            {new Intl.NumberFormat('ru-RU', {
              minimumFractionDigits: 0,
              maximumFractionDigits: rate > 1 ? (rate > 100 ? 0 : 2) : 8,
            }).format(rate)}
          </span>
          <Balance
            balance={toDecimal(to.value, to.scale)}
            currency={toCurrency}
          />
        </div>
      </div>
      {separator && <Separator />}
    </>
  )
}
