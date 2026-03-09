import { HugeiconsIcon, type HugeiconsIconProps } from '@hugeicons/react'
import { Loading03Icon } from '@hugeicons/core-free-icons'

import { cn } from '@/lib/utils'

function Spinner({
  className,
  size = 16,
  ...props
}: Omit<HugeiconsIconProps, 'icon'>) {
  return (
    <HugeiconsIcon
      role="status"
      icon={Loading03Icon}
      aria-label="Loading"
      className={cn('animate-spin', className)}
      size={size}
      {...props}
    />
  )
}

export { Spinner }
