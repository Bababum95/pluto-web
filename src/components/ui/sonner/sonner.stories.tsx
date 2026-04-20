import type { Meta, StoryObj } from '@storybook/react-vite'
import { toast, Toaster as SonnerBase } from 'sonner'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  CheckmarkCircle02Icon,
  InformationCircleIcon,
  Alert02Icon,
  MultiplicationSignCircleIcon,
  Loading03Icon,
} from '@hugeicons/core-free-icons'

import { Button } from '@/components/ui/button'
import { Toaster } from './sonner'

/**
 * Shared icon config mirroring what Toaster injects, used
 * when rendering SonnerBase directly (no router context needed).
 */
const sharedIcons = {
  success: (
    <HugeiconsIcon
      icon={CheckmarkCircle02Icon}
      strokeWidth={2}
      className="size-4"
    />
  ),
  info: (
    <HugeiconsIcon
      icon={InformationCircleIcon}
      strokeWidth={2}
      className="size-4"
    />
  ),
  warning: (
    <HugeiconsIcon icon={Alert02Icon} strokeWidth={2} className="size-4" />
  ),
  error: (
    <HugeiconsIcon
      icon={MultiplicationSignCircleIcon}
      strokeWidth={2}
      className="size-4"
    />
  ),
  loading: (
    <HugeiconsIcon
      icon={Loading03Icon}
      strokeWidth={2}
      className="size-4 animate-spin"
    />
  ),
}

const sharedStyle = {
  '--normal-bg': 'var(--popover)',
  '--normal-text': 'var(--popover-foreground)',
  '--normal-border': 'var(--border)',
  '--border-radius': 'var(--radius)',
} as React.CSSProperties

const meta = {
  title: 'UI/Sonner',
  /**
   * Use SonnerBase (no router dep) as the component reference so
   * Storybook doesn't complain about missing RouterContext.
   * The real Toaster wrapper is rendered inside each story via render().
   */
  component: SonnerBase,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof SonnerBase>

export default meta

type Story = StoryObj<typeof meta>

export const AllTypes: Story = {
  render: () => (
    <div className="flex flex-col items-center gap-3">
      <SonnerBase icons={sharedIcons} style={sharedStyle} />

      <Button onClick={() => toast.success('Profile saved successfully')}>
        Success
      </Button>
      <Button
        variant="secondary"
        onClick={() => toast.info('New update available')}
      >
        Info
      </Button>
      <Button
        variant="outline"
        onClick={() => toast.warning('Storage is almost full')}
      >
        Warning
      </Button>
      <Button
        variant="destructive"
        onClick={() => toast.error('Failed to delete item')}
      >
        Error
      </Button>
      <Button
        variant="ghost"
        onClick={() => toast.loading('Uploading file…', { duration: 3000 })}
      >
        Loading
      </Button>
      <Button
        variant="ghost"
        onClick={() => toast('Default message without an icon')}
      >
        Default
      </Button>
    </div>
  ),
}

export const Success: Story = {
  render: () => (
    <div className="flex flex-col items-center gap-3">
      <SonnerBase icons={sharedIcons} style={sharedStyle} />
      <Button onClick={() => toast.success('Changes saved!')}>
        Show Success
      </Button>
    </div>
  ),
}

export const Error: Story = {
  render: () => (
    <div className="flex flex-col items-center gap-3">
      <SonnerBase icons={sharedIcons} style={sharedStyle} />
      <Button
        variant="destructive"
        onClick={() => toast.error('Something went wrong. Please try again.')}
      >
        Show Error
      </Button>
    </div>
  ),
}

export const Warning: Story = {
  render: () => (
    <div className="flex flex-col items-center gap-3">
      <SonnerBase icons={sharedIcons} style={sharedStyle} />
      <Button
        variant="outline"
        onClick={() => toast.warning('This action cannot be undone.')}
      >
        Show Warning
      </Button>
    </div>
  ),
}

export const Info: Story = {
  render: () => (
    <div className="flex flex-col items-center gap-3">
      <SonnerBase icons={sharedIcons} style={sharedStyle} />
      <Button
        variant="secondary"
        onClick={() => toast.info('Your session will expire in 5 minutes.')}
      >
        Show Info
      </Button>
    </div>
  ),
}

export const LoadingToast: Story = {
  name: 'Loading',
  render: () => (
    <div className="flex flex-col items-center gap-3">
      <SonnerBase icons={sharedIcons} style={sharedStyle} />
      <Button
        variant="ghost"
        onClick={() => toast.loading('Processing request…', { duration: 4000 })}
      >
        Show Loading
      </Button>
    </div>
  ),
}

export const WithDescription: Story = {
  render: () => (
    <div className="flex flex-col items-center gap-3">
      <SonnerBase icons={sharedIcons} style={sharedStyle} />
      <Button
        onClick={() =>
          toast.success('Payment processed', {
            description: 'Your invoice #1042 has been paid.',
          })
        }
      >
        With Description
      </Button>
    </div>
  ),
}

export const WithAction: Story = {
  render: () => (
    <div className="flex flex-col items-center gap-3">
      <SonnerBase icons={sharedIcons} style={sharedStyle} />
      <Button
        onClick={() =>
          toast('Item moved to trash', {
            action: {
              label: 'Undo',
              onClick: () => toast.success('Restored!'),
            },
          })
        }
      >
        With Action
      </Button>
    </div>
  ),
}

export const PromiseToast: Story = {
  name: 'Promise',
  render: () => {
    const handlePromise = () => {
      const promise = new Promise<void>((resolve) =>
        setTimeout(() => resolve(), 10000)
      )
      toast.promise(promise, {
        loading: 'Saving changes…',
        success: 'Changes saved!',
        error: 'Failed to save.',
      })
    }

    return (
      <div className="flex flex-col items-center gap-3">
        <SonnerBase icons={sharedIcons} style={sharedStyle} />
        <Button onClick={handlePromise}>Promise Toast</Button>
      </div>
    )
  },
}

/**
 * Renders the real Toaster wrapper that includes
 * the route-change dismiss behaviour.
 * Requires RouterContext — works inside the full app.
 */
export const WithRouterToaster: Story = {
  name: 'With Router Toaster (app only)',
  tags: ['!autodocs'],
  render: () => (
    <div className="flex flex-col items-center gap-3">
      <Toaster />
      <Button onClick={() => toast.success('Router-aware toast!')}>
        Trigger toast
      </Button>
    </div>
  ),
}
