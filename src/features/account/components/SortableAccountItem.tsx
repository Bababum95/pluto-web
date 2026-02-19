import { useSortable } from '@dnd-kit/react/sortable'
import type { FC } from 'react'

import { cn } from '@/lib/utils'

import { AccountItem, type AccountItemProps } from './AccountItem'

type Props = {
  accountItemProps: AccountItemProps
  id: string
  index: number
}

export const SortableAccountItem: FC<Props> = ({
  id,
  index,
  accountItemProps,
}) => {
  const { ref, isDragging } = useSortable({ id, index })

  const handleClick = (evt: React.MouseEvent) => {
    if (isDragging) {
      evt.preventDefault()
      return
    }
    accountItemProps.onClick?.(evt)
  }

  return (
    <div
      ref={ref}
      data-dragging={isDragging}
      onClick={handleClick}
      className={cn(
        'transition-transform duration-100',
        isDragging && 'scale-103 rounded-xl shadow-sm bg-card/75'
      )}
    >
      <AccountItem
        {...accountItemProps}
        separator={accountItemProps.separator && !isDragging}
      />
    </div>
  )
}
