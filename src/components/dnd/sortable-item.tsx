import { useSortable } from '@dnd-kit/react/sortable'
import type { FC, PropsWithChildren, MouseEvent } from 'react'

import { cn } from '@/lib/utils'

type Props = PropsWithChildren<{
  id: string
  index: number
  onClick?: (evt: MouseEvent) => void
}>

export const SortableItem: FC<Props> = ({ id, index, onClick, children }) => {
  const { ref, isDragging } = useSortable({ id, index })

  const handleClick = (evt: MouseEvent) => {
    if (isDragging) {
      evt.preventDefault()
      return
    }

    onClick?.(evt)
  }

  return (
    <div
      ref={ref}
      data-dragging={isDragging}
      onClick={handleClick}
      className={cn(
        'transition-transform duration-100 select-none',
        isDragging
          ? 'scale-105 rounded-xl shadow-sm bg-card/75'
          : 'active:scale-[0.95]'
      )}
    >
      {children}
    </div>
  )
}
