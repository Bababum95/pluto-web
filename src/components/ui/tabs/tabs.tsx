'use client'

import * as TabsPrimitive from '@radix-ui/react-tabs'
import {
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect,
  useRef,
  type FC,
  type ComponentProps,
} from 'react'
import { AnimatePresence, motion } from 'motion/react'

import { cn } from '@/lib/utils'

const SWIPE_OFFSET = 300

type TabsContextValue = {
  activeValue: string
  direction: number
  registerTab: (value: string) => void
  tabElementsRef: { current: Map<string, HTMLElement> }
}

const TabsContext = createContext<TabsContextValue>({
  activeValue: '',
  direction: 0,
  registerTab: () => {},
  tabElementsRef: { current: new Map() },
})

const Tabs: FC<ComponentProps<typeof TabsPrimitive.Root>> = ({
  className,
  value,
  defaultValue,
  onValueChange,
  ...props
}) => {
  const [localValue, setLocalValue] = useState(defaultValue ?? '')
  const [direction, setDirection] = useState(0)
  const tabsOrderRef = useRef<string[]>([])
  const tabElementsRef = useRef<Map<string, HTMLElement>>(new Map())

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
        registerTab,
        tabElementsRef,
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

type IndicatorState = { left: number; width: number } | null

const TabsList: FC<ComponentProps<typeof TabsPrimitive.List>> = ({
  className,
  children,
  ...props
}) => {
  const { activeValue, tabElementsRef } = useContext(TabsContext)
  const listRef = useRef<HTMLDivElement>(null)
  const [indicator, setIndicator] = useState<IndicatorState>(null)

  useEffect(() => {
    const el = tabElementsRef.current.get(activeValue)
    const list = listRef.current
    if (!el || !list) return

    const listRect = list.getBoundingClientRect()
    const elRect = el.getBoundingClientRect()

    setIndicator({
      left: elRect.left - listRect.left,
      width: elRect.width,
    })
  }, [activeValue, tabElementsRef])

  return (
    <TabsPrimitive.List
      ref={listRef}
      data-slot="tabs-list"
      className={cn(
        'bg-muted text-muted-foreground relative inline-flex h-9 w-fit items-center justify-center rounded-lg p-[2px]',
        className
      )}
      {...props}
    >
      <motion.span
        className="pointer-events-none absolute top-[2px] bottom-[2px] rounded-md bg-background shadow-sm dark:bg-input/30 dark:border dark:border-input"
        animate={{
          left: indicator?.left ?? 0,
          width: indicator?.width ?? 0,
          opacity: indicator ? 1 : 0,
        }}
        transition={{
          left: { type: 'spring', stiffness: 500, damping: 38 },
          width: { type: 'spring', stiffness: 500, damping: 38 },
          opacity: { duration: 0 },
        }}
      />
      {children}
    </TabsPrimitive.List>
  )
}

const TabsTrigger: FC<ComponentProps<typeof TabsPrimitive.Trigger>> = ({
  className,
  value,
  children,
  ...props
}) => {
  const { registerTab, tabElementsRef } = useContext(TabsContext)

  useEffect(() => {
    if (value) registerTab(value)
  }, [value, registerTab])

  const handleRef = useCallback(
    (el: HTMLButtonElement | null) => {
      if (value && el) {
        tabElementsRef.current.set(value, el)
      }
    },
    [value, tabElementsRef]
  )

  return (
    <TabsPrimitive.Trigger
      ref={handleRef}
      data-slot="tabs-trigger"
      value={value}
      className={cn(
        "relative dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:text-muted-foreground text-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
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
