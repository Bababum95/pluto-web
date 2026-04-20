'use client'

import {
  createContext,
  useContext,
  useId,
  useState,
  type ComponentProps,
  type FC,
} from 'react'
import { ToggleGroup as ToggleGroupPrimitive } from 'radix-ui'
import { motion } from 'motion/react'
import type { VariantProps } from 'class-variance-authority'

import { toggleVariants } from '@/components/ui/toggle'
import { cn } from '@/lib/utils'

type ToggleGroupContextValue = VariantProps<typeof toggleVariants> & {
  spacing?: number
  orientation?: 'horizontal' | 'vertical'
  activeValues: string[]
  layoutId: string
  isSingle: boolean
}

const ToggleGroupContext = createContext<ToggleGroupContextValue>({
  size: 'default',
  variant: 'default',
  spacing: 0,
  orientation: 'horizontal',
  activeValues: [],
  layoutId: 'toggle-indicator',
  isSingle: true,
})

type ToggleGroupProps = ComponentProps<typeof ToggleGroupPrimitive.Root> &
  VariantProps<typeof toggleVariants> & {
    spacing?: number
    orientation?: 'horizontal' | 'vertical'
  }

const normalizeToArray = (v: string | string[] | undefined): string[] => {
  if (!v) return []
  return Array.isArray(v) ? v : [v]
}

const ToggleGroup: FC<ToggleGroupProps> = ({
  className,
  variant,
  size,
  spacing = 0,
  orientation = 'horizontal',
  children,
  ...props
}) => {
  const id = useId()

  const rawProps = props as {
    type?: 'single' | 'multiple'
    value?: string | string[]
    defaultValue?: string | string[]
    onValueChange?: (v: string & string[]) => void
  }

  const isSingle = rawProps.type !== 'multiple'

  const [localValues, setLocalValues] = useState<string[]>(() =>
    normalizeToArray(rawProps.defaultValue)
  )

  const activeValues =
    rawProps.value !== undefined
      ? normalizeToArray(rawProps.value)
      : localValues

  const handleValueChange = (v: string & string[]) => {
    setLocalValues(normalizeToArray(v))
    rawProps.onValueChange?.(v)
  }

  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      data-variant={variant}
      data-size={size}
      data-spacing={spacing}
      data-orientation={orientation}
      style={{ '--gap': spacing } as React.CSSProperties}
      className={cn(
        'group/toggle-group flex w-fit flex-row items-center gap-[--spacing(var(--gap))] rounded-md data-[spacing=0]:data-[variant=outline]:shadow-xs data-vertical:flex-col data-vertical:items-stretch',
        className
      )}
      {...(props as ComponentProps<typeof ToggleGroupPrimitive.Root>)}
      onValueChange={handleValueChange}
    >
      <ToggleGroupContext.Provider
        value={{
          variant,
          size,
          spacing,
          orientation,
          activeValues,
          layoutId: `toggle-indicator-${id}`,
          isSingle,
        }}
      >
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  )
}

type ToggleGroupItemProps = ComponentProps<typeof ToggleGroupPrimitive.Item> &
  VariantProps<typeof toggleVariants>

const ToggleGroupItem: FC<ToggleGroupItemProps> = ({
  className,
  children,
  value = '',
  variant = 'default',
  size = 'default',
  ...props
}) => {
  const context = useContext(ToggleGroupContext)
  const isActive = context.activeValues.includes(value)
  const itemLayoutId = context.isSingle
    ? context.layoutId
    : `${context.layoutId}-${value}`

  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      data-variant={context.variant || variant}
      data-size={context.size || size}
      data-spacing={context.spacing}
      value={value}
      className={cn(
        'relative shrink-0 group-data-[spacing=0]/toggle-group:rounded-none group-data-[spacing=0]/toggle-group:px-2 group-data-[spacing=0]/toggle-group:shadow-none focus:z-10 focus-visible:z-10 group-data-[spacing=0]/toggle-group:has-data-[icon=inline-end]:pr-1.5 group-data-[spacing=0]/toggle-group:has-data-[icon=inline-start]:pl-1.5 group-data-horizontal/toggle-group:data-[spacing=0]:first:rounded-l-md group-data-vertical/toggle-group:data-[spacing=0]:first:rounded-t-md group-data-horizontal/toggle-group:data-[spacing=0]:last:rounded-r-md group-data-vertical/toggle-group:data-[spacing=0]:last:rounded-b-md group-data-horizontal/toggle-group:data-[spacing=0]:data-[variant=outline]:border-l-0 group-data-vertical/toggle-group:data-[spacing=0]:data-[variant=outline]:border-t-0 group-data-horizontal/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-l group-data-vertical/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-t',
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        className
      )}
      {...props}
    >
      {isActive && (
        <motion.span
          layoutId={itemLayoutId}
          className="absolute inset-0 rounded-[inherit] bg-muted"
          transition={{ type: 'spring', stiffness: 500, damping: 38 }}
        />
      )}
      <span className="relative z-10 flex items-center gap-1">{children}</span>
    </ToggleGroupPrimitive.Item>
  )
}

export { ToggleGroup, ToggleGroupItem }
