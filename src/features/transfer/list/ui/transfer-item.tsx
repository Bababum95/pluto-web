import { ArrowDown02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

import { Icon } from '@/shared/ui/icon'
import { Separator } from '@/shared/ui/separator'
import { useAppSelector } from '@/app/store'
import { selectAccountById } from '@/entities/account'
import { Balance } from '@/features/money'
import { toDecimal } from '@/shared/lib/money/utils/toDecimal'

import type { TransferDto } from '../../types'

type TransferItemProps = TransferDto & {
  onClick?: () => void
  separator?: boolean
}

type AccountRowProps = {
  icon?: string
  color?: string
  name: string
}

function AccountRow({ icon, color, name }: AccountRowProps) {
  return (
    <div className="flex items-center gap-2">
      <Icon name={icon} color={color} size={16} className="p-1" />
      <span>{name}</span>
    </div>
  )
}

export function TransferItem({
  from,
  to,
  rate,
  onClick,
  separator = false,
}: TransferItemProps) {
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
          <AccountRow
            icon={fromAccount?.icon}
            color={fromAccount?.color}
            name={fromName}
          />
          <AccountRow
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
