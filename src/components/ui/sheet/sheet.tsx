import * as SheetPrimitive from '@radix-ui/react-dialog'
import { cva, type VariantProps } from 'class-variance-authority'
import { useTranslation } from 'react-i18next'
import { HugeiconsIcon } from '@hugeicons/react'
import { Cancel01Icon } from '@hugeicons/core-free-icons'
import type { ComponentProps, FC } from 'react'

import { cn } from '@/lib/utils'

const Sheet: FC<ComponentProps<typeof SheetPrimitive.Root>> = ({
  ...props
}) => <SheetPrimitive.Root data-slot="sheet" {...props} />

const SheetTrigger: FC<ComponentProps<typeof SheetPrimitive.Trigger>> = ({
  ...props
}) => <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />

const SheetClose: FC<ComponentProps<typeof SheetPrimitive.Close>> = ({
  ...props
}) => <SheetPrimitive.Close data-slot="sheet-close" {...props} />

const SheetPortal: FC<ComponentProps<typeof SheetPrimitive.Portal>> = ({
  ...props
}) => <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />

const SheetOverlay: FC<ComponentProps<typeof SheetPrimitive.Overlay>> = ({
  className,
  ...props
}) => (
  <SheetPrimitive.Overlay
    data-slot="sheet-overlay"
    className={cn(
      'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50',
      className
    )}
    {...props}
  />
)

const sheetContentVariants = cva(
  'data-[state=open]:animate-in data-[state=closed]:animate-out fixed z-50 flex flex-col gap-4 transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 shadow-lg',
  {
    variants: {
      side: {
        right:
          'data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right inset-y-0 right-0 h-full w-3/4 sm:max-w-sm',
        left: 'data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left inset-y-0 left-0 h-full w-3/4 sm:max-w-sm',
        top: 'data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top inset-x-0 top-0 h-auto',
        bottom:
          'data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom inset-x-0 bottom-0 h-auto',
      },
      variant: {
        legacy: 'bg-background',
        liquid:
          'bg-white/10 dark:bg-white/5 supports-[backdrop-filter]:backdrop-blur-lg supports-[backdrop-filter]:backdrop-saturate-150 border border-white/20 dark:border-white/10 rounded-2xl',
      },
    },
    compoundVariants: [
      { side: 'right', variant: 'legacy', class: 'border-l' },
      { side: 'left', variant: 'legacy', class: 'border-r' },
      { side: 'top', variant: 'legacy', class: 'border-b' },
      { side: 'bottom', variant: 'legacy', class: 'border-t' },
      {
        side: 'right',
        variant: 'liquid',
        class: 'inset-y-3 right-3 h-[calc(100%-24px)]',
      },
      {
        side: 'left',
        variant: 'liquid',
        class: 'inset-y-3 left-3 h-[calc(100%-24px)]',
      },
      {
        side: 'top',
        variant: 'liquid',
        class: 'inset-x-3 top-3',
      },
      {
        side: 'bottom',
        variant: 'liquid',
        class: 'inset-x-3 bottom-3',
      },
    ],
    defaultVariants: {
      side: 'right',
      variant: 'legacy',
    },
  }
)

type SheetContentProps = ComponentProps<typeof SheetPrimitive.Content> &
  VariantProps<typeof sheetContentVariants> & {
    closable?: boolean
  }

const SheetContent: FC<SheetContentProps> = ({
  className,
  children,
  side = 'right',
  variant = 'legacy',
  closable = true,
  ...props
}) => {
  const { t } = useTranslation()

  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        className={cn(sheetContentVariants({ side, variant }), className)}
        {...props}
      >
        {children}
        {closable && (
          <SheetClose className="ring-offset-background focus:ring-ring data-[state=open]:bg-secondary absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none">
            <HugeiconsIcon icon={Cancel01Icon} className="size-6" />
            <span className="sr-only">{t('common.actions.close')}</span>
          </SheetClose>
        )}
      </SheetPrimitive.Content>
    </SheetPortal>
  )
}

const SheetHeader: FC<ComponentProps<'div'>> = ({ className, ...props }) => (
  <div
    data-slot="sheet-header"
    className={cn('flex flex-col gap-1.5 p-4', className)}
    {...props}
  />
)

const SheetFooter: FC<ComponentProps<'div'>> = ({ className, ...props }) => (
  <div
    data-slot="sheet-footer"
    className={cn('mt-auto flex flex-col gap-2 p-4', className)}
    {...props}
  />
)

const SheetTitle: FC<ComponentProps<typeof SheetPrimitive.Title>> = ({
  className,
  ...props
}) => (
  <SheetPrimitive.Title
    data-slot="sheet-title"
    className={cn('text-foreground font-semibold', className)}
    {...props}
  />
)

const SheetDescription: FC<
  ComponentProps<typeof SheetPrimitive.Description>
> = ({ className, ...props }) => (
  <SheetPrimitive.Description
    data-slot="sheet-description"
    className={cn('text-muted-foreground text-sm', className)}
    {...props}
  />
)

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
