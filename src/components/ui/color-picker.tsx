'use client'

import * as React from 'react'
import { useCallback, useMemo, useRef, useState } from 'react'
import { ColorPickerIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

import { cn, parseColor, hsbToHex, type HSB } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Field, FieldLabel } from '@/components/ui/field'

/* -------------------------------------------------------------------------- */
/* Context                                                                    */
/* -------------------------------------------------------------------------- */

type ColorPickerContextValue = {
  value: HSB
  setValue: (value: HSB) => void
}

const ColorPickerContext = React.createContext<ColorPickerContextValue | null>(
  null
)

function useColorPickerContext(): ColorPickerContextValue {
  const ctx = React.useContext(ColorPickerContext)
  if (!ctx)
    throw new Error('ColorPicker subcomponents must be used inside ColorPicker')
  return ctx
}

/* -------------------------------------------------------------------------- */
/* ColorPicker (root)                                                         */
/* -------------------------------------------------------------------------- */

export type ColorPickerProps = {
  /** Current value (controlled). */
  value?: string
  /** Default value (uncontrolled). */
  defaultValue?: string
  /** Called when color changes; receives hex string. */
  onChange?: (value: string) => void
  /** Label shown next to the swatch trigger. */
  label?: string
  /** Custom content inside the popover; defaults to ColorArea + ColorSlider + ColorField. */
  children?: React.ReactNode
  className?: string
}

const PRESET_COLORS = ['#3b82f6', '#22c55e', '#eab308', '#ef4444', '#8b5cf6']

function ColorPickerRoot({
  value: valueProp,
  defaultValue = '#00a4e8',
  onChange,
  label,
  children,
  className,
}: ColorPickerProps): React.ReactElement {
  const [internalValue, setInternalValue] = useState<HSB>(() =>
    parseColor(defaultValue)
  )
  const isControlled = valueProp !== undefined
  const value = isControlled ? parseColor(valueProp) : internalValue
  const hexValue = useMemo(() => hsbToHex(value), [value])

  const setValue = useCallback(
    (next: HSB) => {
      if (!isControlled) setInternalValue(next)
      onChange?.(hsbToHex(next))
    },
    [isControlled, onChange]
  )

  const handlePresetSelect = useCallback(
    (hex: string) => {
      setValue(parseColor(hex))
    },
    [setValue]
  )

  const contextValue = useMemo<ColorPickerContextValue>(
    () => ({ value, setValue }),
    [value, setValue]
  )

  return (
    <ColorPickerContext.Provider value={contextValue}>
      <Field>
        {label != null && <FieldLabel>{label}</FieldLabel>}
        <DropdownMenu>
          <div className={cn('grid grid-cols-6 gap-2', className)}>
            {PRESET_COLORS.map((hex) => (
              <button
                key={hex}
                type="button"
                className={cn('rounded-md aspect-square', {
                  ['outline-2 outline-offset-2 outline-primary']:
                    hex === hexValue,
                })}
                style={{ backgroundColor: hex }}
                onClick={() => handlePresetSelect(hex)}
                aria-label={`Select preset color ${hex}`}
              />
            ))}

            <DropdownMenuTrigger asChild>
              <button
                type="button"
                style={{
                  backgroundColor:
                    value !== undefined && !PRESET_COLORS.includes(hexValue)
                      ? hexValue
                      : undefined,
                }}
                className={cn(
                  'rounded-md aspect-square flex items-center justify-center text-xs font-medium border border-border',
                  {
                    ['outline-2 outline-offset-2 outline-primary']:
                      value !== undefined && !PRESET_COLORS.includes(hexValue),
                  }
                )}
                aria-label="Open color picker"
              >
                <HugeiconsIcon icon={ColorPickerIcon} size={24} />
                <span className="sr-only">Open color picker</span>
              </button>
            </DropdownMenuTrigger>
          </div>
          <DropdownMenuContent
            align="start"
            sideOffset={6}
            className={cn('min-w-[192px] flex flex-col gap-3 p-3 rounded-lg')}
            onCloseAutoFocus={(e) => e.preventDefault()}
          >
            {children ?? (
              <>
                <ColorArea />
                <ColorSlider />
                <ColorField label="Hex" />
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </Field>
    </ColorPickerContext.Provider>
  )
}

/* -------------------------------------------------------------------------- */
/* ColorSwatch                                                                */
/* -------------------------------------------------------------------------- */

const ColorSwatch = React.memo(function ColorSwatch({
  className,
}: {
  className?: string
}): React.ReactElement {
  const { value } = useColorPickerContext()
  const hex = hsbToHex(value)
  return (
    <span
      className={cn(
        'h-9 w-full shrink-0 rounded-md border border-border shadow-inner',
        className
      )}
      style={{ backgroundColor: hex }}
    />
  )
})

/* -------------------------------------------------------------------------- */
/* ColorArea (2D saturation / brightness)                                     */
/* -------------------------------------------------------------------------- */

function ColorArea({ className }: { className?: string }): React.ReactElement {
  const { value, setValue } = useColorPickerContext()
  const areaRef = useRef<HTMLDivElement>(null)

  const updateFromPoint = useCallback(
    (clientX: number, clientY: number) => {
      const el = areaRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const x = (clientX - rect.left) / rect.width
      const y = (clientY - rect.top) / rect.height
      const s = Math.max(0, Math.min(1, x)) * 100
      const b = (1 - Math.max(0, Math.min(1, y))) * 100
      setValue({ ...value, s, b })
    },
    [value, setValue]
  )

  const handlePointer = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault()
      if (e.buttons !== 1 && e.type !== 'pointerdown') return
      updateFromPoint(e.clientX, e.clientY)
      const move = (e2: PointerEvent) => updateFromPoint(e2.clientX, e2.clientY)
      const up = () => {
        window.removeEventListener('pointermove', move)
        window.removeEventListener('pointerup', up)
      }
      window.addEventListener('pointermove', move)
      window.addEventListener('pointerup', up)
    },
    [updateFromPoint]
  )

  const hueColor = useMemo(() => `hsl(${value.h}, 100%, 50%)`, [value.h])

  return (
    <div
      ref={areaRef}
      role="slider"
      aria-label="Saturation and brightness"
      aria-valuetext={`Saturation ${Math.round(value.s)}%, Brightness ${Math.round(value.b)}%`}
      tabIndex={0}
      className={cn(
        'relative h-[120px] w-full shrink-0 touch-none select-none rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        className
      )}
      style={{
        background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, ${hueColor})`,
      }}
      onPointerDown={handlePointer}
    >
      <span
        className="absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.3)]"
        style={{
          left: `${(value.s / 100) * 100}%`,
          top: `${(1 - value.b / 100) * 100}%`,
        }}
      />
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* ColorSlider (hue)                                                          */
/* -------------------------------------------------------------------------- */

function ColorSlider({
  className,
}: {
  className?: string
}): React.ReactElement {
  const { value, setValue } = useColorPickerContext()
  const sliderRef = useRef<HTMLDivElement>(null)

  const updateFromPoint = useCallback(
    (clientX: number) => {
      const el = sliderRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const x = (clientX - rect.left) / rect.width
      const h = Math.max(0, Math.min(1, x)) * 360
      setValue({ ...value, h })
    },
    [value, setValue]
  )

  const handlePointer = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault()
      if (e.buttons !== 1 && e.type !== 'pointerdown') return
      updateFromPoint(e.clientX)
      const move = (e2: PointerEvent) => updateFromPoint(e2.clientX)
      const up = () => {
        window.removeEventListener('pointermove', move)
        window.removeEventListener('pointerup', up)
      }
      window.addEventListener('pointermove', move)
      window.addEventListener('pointerup', up)
    },
    [updateFromPoint]
  )

  return (
    <div
      ref={sliderRef}
      role="slider"
      aria-label="Hue"
      aria-valuemin={0}
      aria-valuemax={360}
      aria-valuenow={Math.round(value.h)}
      tabIndex={0}
      className={cn(
        'relative h-3 w-full shrink-0 touch-none select-none rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        className
      )}
      style={{
        background:
          'linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)',
      }}
      onPointerDown={handlePointer}
    >
      <span
        className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.3)]"
        style={{ left: `${(value.h / 360) * 100}%` }}
      />
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* ColorField (hex input)                                                     */
/* -------------------------------------------------------------------------- */

export type ColorFieldProps = {
  label?: string
  className?: string
}

function ColorField({
  label: labelText,
  className,
}: ColorFieldProps): React.ReactElement {
  const { value, setValue } = useColorPickerContext()
  const [inputValue, setInputValue] = useState(hsbToHex(value))
  const isEditing = useRef(false)

  React.useEffect(() => {
    if (!isEditing.current) setInputValue(hsbToHex(value))
  }, [value])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value
      setInputValue(raw)
      const normalized = raw.startsWith('#') ? raw : `#${raw}`
      if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(normalized)) {
        const parsed = parseColor(normalized)
        setValue(parsed)
      }
    },
    [setValue]
  )

  const handleFocus = useCallback(() => {
    isEditing.current = true
  }, [])

  const handleBlur = useCallback(() => {
    isEditing.current = false
    setInputValue(hsbToHex(value))
  }, [value])

  return (
    <Field className={className}>
      {labelText != null && <FieldLabel>{labelText}</FieldLabel>}
      <Input
        size="sm"
        value={inputValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className="font-mono text-xs"
        aria-label={labelText ?? 'Hex color'}
      />
    </Field>
  )
}

/* -------------------------------------------------------------------------- */
/* Exports                                                                    */
/* -------------------------------------------------------------------------- */

export const ColorPicker = ColorPickerRoot
export { ColorSwatch, ColorArea, ColorSlider, ColorField }
export type { HSB }
