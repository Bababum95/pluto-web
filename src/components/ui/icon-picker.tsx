'use client'

import { useCallback, useEffect, useMemo, useState, type FC } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { MoreHorizontalCircle01Icon } from '@hugeicons/core-free-icons'

import { cn } from '@/lib/utils'
import { POPULAR_ICONS, isIconName, ICON_CATEGORIES } from '@/lib/icons'
import { Field, FieldLabel } from '@/components/ui/field'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer'
import { Icon } from '@/components/ui/icon'

/* -------------------------------------------------------------------------- */
/* IconPicker                                                                 */
/* -------------------------------------------------------------------------- */

export type IconPickerProps = {
  /** Current value: icon name (controlled). */
  value?: string
  /** Default value (uncontrolled). */
  defaultValue?: string
  /** Called when icon changes; receives icon name. */
  onChange?: (value: string) => void
  /** Label shown above the trigger. */
  label?: string
  /** Placeholder when no icon is selected. */
  placeholder?: string
  /** Number of columns in the icon grid. */
  columns?: number
  /** Icon size in the grid. */
  iconSize?: number
  /** Optional background color for the selected icon preview (e.g. from ColorPicker). */
  iconColor?: string
  className?: string
}

const IconPickerRoot: FC<IconPickerProps> = ({
  value: valueProp,
  defaultValue,
  onChange,
  label,
  iconColor,
  className,
}) => {
  const [icons, setIcons] = useState<string[]>(POPULAR_ICONS)
  const [internalValue, setInternalValue] = useState<string | undefined>(
    defaultValue
  )
  const isControlled = useMemo(() => valueProp !== undefined, [valueProp])
  const value = useMemo(
    () => (isControlled ? valueProp : internalValue),
    [isControlled, valueProp, internalValue]
  )

  const handleSelect = useCallback(
    (name: string) => {
      if (!isControlled) setInternalValue(name)
      onChange?.(name)
    },
    [isControlled, onChange]
  )

  useEffect(() => {
    if (!value || !isIconName(value)) return

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIcons((prev) => {
      if (prev.includes(value)) return prev

      const next = [...prev]
      next.pop()
      next.unshift(value)
      return next
    })
  }, [value])

  return (
    <Field className={className}>
      {label != null && <FieldLabel>{label}</FieldLabel>}
      <div className="grid grid-cols-6 gap-2">
        {icons.map((icon) => (
          <Icon
            key={icon}
            name={icon}
            className={cn({
              ['outline-2 outline-offset-2 outline-primary']: icon === value,
            })}
            color={icon === value ? iconColor : undefined}
            onClick={() => handleSelect(icon)}
          />
        ))}

        <IconDrawer
          value={value}
          onChange={handleSelect}
          iconColor={iconColor}
        />
      </div>
    </Field>
  )
}

type IconDrawerProps = {
  onChange: (value: string) => void
  value?: string
  iconColor?: string
}

const IconDrawer: FC<IconDrawerProps> = ({ value, onChange, iconColor }) => {
  const [isOpen, setIsOpen] = useState(false)

  const handleSelect = useCallback(
    (name: string) => {
      onChange(name)
      setIsOpen(false)
    },
    [onChange]
  )

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="aspect-square w-full h-full"
          type="button"
        >
          <HugeiconsIcon icon={MoreHorizontalCircle01Icon} size={24} />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Select Icon</DrawerTitle>
          <DrawerDescription>
            Choose an account for the transaction
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 overflow-y-auto py-2">
          {ICON_CATEGORIES.map((category) => (
            <div key={category.name}>
              <h3 className="text-sm font-medium mb-2 text-muted-foreground">
                {category.name}
              </h3>
              <div className="grid grid-cols-5 gap-2 mb-4">
                {category.icons.map((icon) => (
                  <Icon
                    key={icon}
                    name={icon}
                    className={cn({
                      ['outline-2 outline-offset-2 outline-primary']:
                        icon === value,
                    })}
                    color={icon === value ? iconColor : undefined}
                    onClick={() => handleSelect(icon)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  )
}

/* -------------------------------------------------------------------------- */
/* Exports                                                                    */
/* -------------------------------------------------------------------------- */

export const IconPicker = IconPickerRoot
export { Icon }
