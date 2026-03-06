import { useSortable } from '@dnd-kit/react/sortable'
import type { FC } from 'react'

import { cn } from '@/lib/utils'

import type { Category } from '../types'

import { CategoryCard } from './CategoryCard'

type Props = {
  category: Category
  id: string
  index: number
  onClick?: (id: string) => void
}

export const SortableCategoryItem: FC<Props> = ({
  id,
  index,
  category,
  onClick,
}) => {
  const { ref, isDragging } = useSortable({ id, index })

  const handleClick = (evt: React.MouseEvent) => {
    if (isDragging) {
      evt.preventDefault()
      return
    }
    onClick?.(id)
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
      <CategoryCard category={category} />
    </div>
  )
}
