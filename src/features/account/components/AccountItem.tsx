import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'
import { type FC, createElement } from 'react'

import { getIconByName, DEFAULT_ICON } from '@/lib/icons'
import { Balance } from '@/features/money'

import type { Account } from '../types'

type Props = Account & {
  onClick?: () => void
  actions?: React.ReactNode
}

export const AccountItem: FC<Props> = ({
  name,
  balance,
  color,
  icon,
  onClick,
  actions,
}) => {
  const ResolvedIcon = getIconByName(icon) ?? DEFAULT_ICON

  return (
    <Item size="sm" onClick={onClick}>
      <ItemMedia variant="icon" style={{ backgroundColor: color }}>
        {createElement(ResolvedIcon, { size: 20, className: 'size-5' })}
      </ItemMedia>
      <ItemContent className="gap-0">
        <ItemTitle>{name}</ItemTitle>
        {actions && (
          <ItemDescription className="text-xs">
            <Balance
              balance={balance.original.value}
              currency={balance.original.currency}
            />
          </ItemDescription>
        )}
      </ItemContent>
      <ItemActions>
        {actions || (
          <div className="flex flex-col items-end">
            <Balance
              balance={balance.original.value}
              currency={balance.original.currency}
            />
            {balance.converted.currency.code !==
              balance.original.currency.code && (
              <Balance
                className="text-xs text-muted-foreground font-normal"
                balance={balance.converted.value}
                currency={balance.converted.currency}
              />
            )}
          </div>
        )}
      </ItemActions>
    </Item>
  )
}
