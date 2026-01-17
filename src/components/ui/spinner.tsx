import { HugeiconsIcon, type HugeiconsIconProps } from '@hugeicons/react'
import { Loading03Icon } from '@hugeicons/core-free-icons'

import { cn } from '@/lib/utils'

function Spinner({ className, ...props }: Omit<HugeiconsIconProps, 'icon'>) {
  return (
    <HugeiconsIcon
      role="status"
      icon={Loading03Icon}
      aria-label="Loading"
      className={cn('size-4 animate-spin', className)}
      {...props}
    />
  )
}

export { Spinner }
