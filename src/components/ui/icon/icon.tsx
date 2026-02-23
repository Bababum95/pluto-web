import { type FC, createElement } from 'react'

import { cn } from '@/lib/utils'
import { DEFAULT_ICON, getIconByName } from '@/lib/icons'

export type IconProps = React.ComponentProps<'div'> & {
  /** Icon name from the registry (e.g. "Dollar01Icon"). */
  name: string
  /** Optional size in pixels. */
  size?: number
  /** Optional className for the svg wrapper. */
  className?: string
  /** Optional style. */
  color?: string
}

/**
 * Renders an icon by its registry name.
 * Use the value from IconPicker to display the selected icon elsewhere.
 */
export const Icon: FC<IconProps> = ({
  name,
  className,
  size = 28,
  color,
  ...props
}) => {
  const ResolvedIcon = getIconByName(name) ?? DEFAULT_ICON

  return (
    <div
      style={{ backgroundColor: color, color: '#FFFFFF' }}
      className={cn(
        'rounded-sm bg-muted p-2 aspect-square flex items-center justify-center',
        className
      )}
      {...props}
    >
      {createElement(ResolvedIcon, { size })}
    </div>
  )
}
