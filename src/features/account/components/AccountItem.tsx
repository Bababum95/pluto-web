import { type FC, createElement } from 'react'
import { ViewOffSlashIcon } from '@hugeicons/core-free-icons'
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
import { getIconByName, DEFAULT_ICON } from '@/lib/icons'
import { Balance } from '@/features/money'

import type { Account } from '../types'

type Props = Account & {
  onClick?: (evt: React.MouseEvent) => void
  actions?: React.ReactNode
  separator?: boolean
}

export const AccountItem: FC<Props> = ({
  name,
  balance,
  color,
  icon,
  actions,
  description,
  onClick,
  excluded,
  separator = false,
}) => {
  const ResolvedIcon = getIconByName(icon) ?? DEFAULT_ICON

  return (
    <>
      <Item size="sm" onClick={onClick}>
        <ItemMedia
          variant="icon"
          style={{ backgroundColor: color, color: '#FFFFFF' }}
        >
          {createElement(ResolvedIcon, { size: 20, className: 'size-5' })}
        </ItemMedia>
        <ItemContent className="gap-0">
          <div className="flex items-center justify-between">
            <div>
              <ItemTitle>{name}</ItemTitle>
              {actions ? (
                <ItemDescription className="text-xs">
                  <Balance
                    balance={balance.original.value}
                    currency={balance.original.currency}
                  />
                </ItemDescription>
              ) : (
                description && (
                  <ItemDescription className="text-xs">
                    {description}
                  </ItemDescription>
                )
              )}
            </div>
            {excluded && <HugeiconsIcon icon={ViewOffSlashIcon} size={18} />}
          </div>
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
      {separator && <ItemSeparator />}
    </>
  )
}

export type AccountItemProps = Props
