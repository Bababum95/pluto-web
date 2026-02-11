import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'
import { HugeiconsIcon } from '@hugeicons/react'
import type { FC } from 'react'

import { getIconByName, DEFAULT_ICON } from '@/lib/icons'
import { Balance } from '@/features/money'

import type { Account } from '../types'

type Props = Account & {
  onClick?: () => void
  actions?: React.ReactNode
}

export const AccountItem: FC<Props> = ({
  name,
  currency,
  balance,
  color,
  icon,
  onClick,
  actions,
}) => {
  const iconElement = getIconByName(icon) ?? DEFAULT_ICON

  return (
    <Item size="sm" onClick={onClick}>
      <ItemMedia variant="icon" style={{ backgroundColor: color }}>
        <HugeiconsIcon icon={iconElement} className="size-5" />
      </ItemMedia>
      <ItemContent className="gap-0">
        <ItemTitle>{name}</ItemTitle>
        {actions && (
          <ItemDescription className="text-xs">
            <Balance balance={balance} currency={currency} />
          </ItemDescription>
        )}
      </ItemContent>
      <ItemActions>
        {actions || <Balance balance={balance} currency={currency} />}
      </ItemActions>
    </Item>
  )
}
