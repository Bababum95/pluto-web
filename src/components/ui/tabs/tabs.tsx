'use client'

import * as TabsPrimitive from '@radix-ui/react-tabs'
import * as motion from 'motion/react-client'
import {
  createContext,
  useId,
  useState,
  useContext,
  useCallback,
  useEffect,
  useRef,
  type FC,
  type ComponentProps,
} from 'react'
import { AnimatePresence } from 'motion/react'

import { cn } from '@/lib/utils'

const SWIPE_OFFSET = 300

type TabsContextValue = {
  activeValue: string
  direction: number
  layoutId: string
  registerTab: (value: string) => void
}

const TabsContext = createContext<TabsContextValue>({
  activeValue: '',
  direction: 0,
  layoutId: 'tab-indicator',
  registerTab: () => {},
})

const Tabs: FC<ComponentProps<typeof TabsPrimitive.Root>> = ({
  className,
  value,
  defaultValue,
  onValueChange,
  ...props
}) => {
  const id = useId()
  const [localValue, setLocalValue] = useState(defaultValue ?? '')
  const [direction, setDirection] = useState(0)
  const tabsOrderRef = useRef<string[]>([])

  const activeValue = value ?? localValue

  const registerTab = useCallback((tabValue: string) => {
    if (!tabsOrderRef.current.includes(tabValue)) {
      tabsOrderRef.current.push(tabValue)
    }
  }, [])

  const handleValueChange = (v: string) => {
    const currentIndex = tabsOrderRef.current.indexOf(activeValue)
    const nextIndex = tabsOrderRef.current.indexOf(v)
    if (currentIndex !== -1 && nextIndex !== -1) {
      setDirection(nextIndex > currentIndex ? 1 : -1)
    }
    setLocalValue(v)
    onValueChange?.(v)
  }

  return (
    <TabsContext.Provider
      value={{
        activeValue,
        direction,
        layoutId: id,
        registerTab,
      }}
    >
      <TabsPrimitive.Root
        data-slot="tabs"
        className={cn('flex flex-col gap-2', className)}
        value={value}
        defaultValue={defaultValue}
        onValueChange={handleValueChange}
        {...props}
      />
    </TabsContext.Provider>
  )
}

const TabsList: FC<ComponentProps<typeof TabsPrimitive.List>> = ({
  className,
  ...props
}) => (
  <TabsPrimitive.List
    data-slot="tabs-list"
    className={cn(
      'bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[2px]',
      className
    )}
    {...props}
  />
)

const TabsTrigger: FC<ComponentProps<typeof TabsPrimitive.Trigger>> = ({
  className,
  value,
  children,
  ...props
}) => {
  const { activeValue, layoutId, registerTab } = useContext(TabsContext)
  const isActive = activeValue === value

  useEffect(() => {
    if (value) registerTab(value)
  }, [value, registerTab])

  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      value={value}
      className={cn(
        "relative dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:text-muted-foreground text-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {isActive && (
        <motion.span
          layoutId={layoutId}
          id={layoutId}
          style={{ willChange: 'transform', transform: 'translateZ(0)' }}
          transition={{ type: 'spring', stiffness: 500, damping: 40 }}
          className={cn(
            'absolute inset-0 rounded-md bg-background dark:bg-input/30 shadow-sm dark:border dark:border-input',
            className
          )}
        />
      )}
      <span className="relative z-10 flex items-center gap-1.5">
        {children}
      </span>
    </TabsPrimitive.Trigger>
  )
}

const TabsContent: FC<ComponentProps<typeof TabsPrimitive.Content>> = ({
  value,
  children,
  className,
  ...props
}) => {
  const { activeValue, direction } = useContext(TabsContext)
  const isActive = activeValue === value

  return (
    <AnimatePresence mode="popLayout" initial={false}>
      {isActive && (
        <TabsPrimitive.Content
          key={value}
          data-slot="tabs-content"
          value={value}
          forceMount
          asChild
          {...props}
        >
          <motion.div
            className={cn('flex-1 outline-none', className)}
            initial={{ opacity: 0, x: direction * SWIPE_OFFSET }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * SWIPE_OFFSET }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            {children}
          </motion.div>
        </TabsPrimitive.Content>
      )}
    </AnimatePresence>
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
