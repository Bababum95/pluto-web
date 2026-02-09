import { HugeiconsIcon } from '@hugeicons/react'
import type { FC } from 'react'

import { getIconByName, DEFAULT_ICON } from '@/lib/icons'
import { cn } from '@/lib/utils'

import type { Category } from '../types'

type Props = React.ComponentProps<'div'> & {
  category: Category
  asChild?: boolean
  className?: string
}

export const CategoryCard: FC<Props> = ({ category, className, ...props }) => {
  const icon = getIconByName(category.icon)

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2 rounded-xl p-1 active:scale-[0.98]',
        className
      )}
      {...props}
    >
      <div
        className="flex aspect-square w-full items-center max-w-14 justify-center rounded-lg"
        style={{ backgroundColor: category.color }}
      >
        <HugeiconsIcon
          icon={icon ?? DEFAULT_ICON}
          size={28}
          className="text-white"
        />
      </div>
      <span className="truncate text-center text-xs font-medium w-full">
        {category.name}
      </span>
    </div>
  )
}
