import { Slot } from 'radix-ui'
import { cva, type VariantProps } from 'class-variance-authority'
import { forwardRef } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { PlusSignIcon } from '@hugeicons/core-free-icons'

import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 active:scale-95 transition-transform',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow hover:bg-primary/90',
        destructive:
          'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        outline:
          'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
        secondary:
          'dark:bg-input/30 text-secondary-foreground hover:bg-input/80 border border-input',
        ghost:
          'hover:bg-accent hover:text-accent-foreground active:bg-accent active:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        xs: 'h-8 rounded-sm px-2 text-xs',
        sm: 'h-10 rounded-md px-3 text-sm',
        default: 'h-12 px-4',
        lg: 'h-11 rounded-md px-6',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    isLoading?: boolean
  }

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      isLoading = false,
      disabled = false,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot.Root : 'button'

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {asChild ? (
          props.children
        ) : (
          <>
            {isLoading && <Spinner />}
            {props.children}
          </>
        )}
      </Comp>
    )
  }
)

Button.displayName = 'Button'

const PlusButton = () => {
  return (
    <Button
      size="icon"
      className="[&_svg:not([class*='size-'])]:size-6 w-13 h-13 rounded-full"
    >
      <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />
    </Button>
  )
}

export { Button, buttonVariants, PlusButton }
