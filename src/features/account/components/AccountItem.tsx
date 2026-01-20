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

import type { AccountItemProps } from '../type'

export const AccountItem: FC<AccountItemProps> = ({
  name,
  currency,
  balance,
  iconColor,
  icon,
  onClick,
  actions,
}) => {
  const balanceContent = `${currency} ${balance}`

  return (
    <Item size="sm" onClick={onClick}>
      <ItemMedia variant="icon" style={{ backgroundColor: iconColor }}>
        <HugeiconsIcon icon={icon} className="size-5" />
      </ItemMedia>
      <ItemContent className='gap-0'>
        <ItemTitle>{name}</ItemTitle>
        {actions && <ItemDescription className='text-xs'>{balanceContent}</ItemDescription>}
      </ItemContent>
      <ItemActions>
        {actions || <span className="font-medium">{balanceContent}</span>}
      </ItemActions>
    </Item>
  )
}
