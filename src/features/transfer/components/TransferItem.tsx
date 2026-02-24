import type { FC } from 'react'
import { ArrowRight01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
  ItemSeparator,
} from '@/components/ui/item'
import { useAppSelector } from '@/store'
import { selectAccountById } from '@/store/slices/account'
import { toDecimalString } from '@/features/money'

import type { Transfer } from '../types'

type Props = Transfer & {
  onClick?: () => void
  separator?: boolean
}

export const TransferItem: FC<Props> = ({
  from,
  to,
  rate,
  createdAt,
  onClick,
  separator = false,
}) => {
  const fromAccount = useAppSelector((state) =>
    selectAccountById(state, from.account)
  )
  const toAccount = useAppSelector((state) =>
    selectAccountById(state, to.account)
  )

  const fromValue = toDecimalString(from.value, from.scale)
  const toValue = toDecimalString(to.value, to.scale)

  const fromName = fromAccount?.name ?? from.account
  const toName = toAccount?.name ?? to.account

  const fromCurrency = fromAccount?.balance.original.currency.code ?? ''
  const toCurrency = toAccount?.balance.original.currency.code ?? ''

  return (
    <>
      <Item size="sm" onClick={onClick}>
        <ItemMedia
          variant="icon"
          style={{
            backgroundColor: fromAccount?.color ?? '#6b7280',
            color: '#FFFFFF',
          }}
        >
          <HugeiconsIcon icon={ArrowRight01Icon} size={20} />
        </ItemMedia>
        <ItemContent className="gap-0">
          <ItemTitle className="flex items-center gap-1">
            <span>{fromName}</span>
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              size={14}
              className="text-muted-foreground shrink-0"
            />
            <span>{toName}</span>
          </ItemTitle>
          <ItemDescription className="text-xs">
            {new Date(createdAt).toLocaleDateString()}
            {rate !== 1 && ` · rate: ${rate}`}
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <div className="flex flex-col items-end text-sm">
            <span className="text-destructive font-medium">
              -{fromValue} {fromCurrency}
            </span>
            <span className="text-emerald-600 text-xs font-medium">
              +{toValue} {toCurrency}
            </span>
          </div>
        </ItemActions>
      </Item>
      {separator && <ItemSeparator />}
    </>
  )
}
