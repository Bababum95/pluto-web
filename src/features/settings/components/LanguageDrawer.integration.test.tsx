import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { renderWithProviders } from '@/testing/render'
import { i18n } from '@/lib/i18n'

vi.mock('@/components/ui/drawer', async () => {
  const React = await import('react')

  type DrawerContextValue = {
    open: boolean
    onOpenChange: (open: boolean) => void
  }

  const DrawerContext = React.createContext<DrawerContextValue>({
    open: false,
    onOpenChange: () => undefined,
  })

  return {
    Drawer: ({
      children,
      open,
      onOpenChange,
    }: {
      children: React.ReactNode
      open: boolean
      onOpenChange?: (open: boolean) => void
    }) => (
      <DrawerContext.Provider
        value={{ open, onOpenChange: onOpenChange ?? (() => undefined) }}
      >
        <div data-testid="mock-drawer-shell">
          <button type="button" onClick={() => onOpenChange?.(true)}>
            open-drawer
          </button>
          <button type="button" onClick={() => onOpenChange?.(false)}>
            close-drawer
          </button>
          {children}
        </div>
      </DrawerContext.Provider>
    ),
    DrawerContent: ({
      children,
      ...props
    }: React.ComponentProps<'div'>) => {
      const { open } = React.useContext(DrawerContext)
      return open ? <div {...props}>{children}</div> : null
    },
    DrawerHeader: ({ children, ...props }: React.ComponentProps<'div'>) => (
      <div {...props}>{children}</div>
    ),
    DrawerTitle: ({ children, ...props }: React.ComponentProps<'div'>) => (
      <div {...props}>{children}</div>
    ),
    DrawerDescription: ({
      children,
      ...props
    }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
  }
})

import { LanguageDrawer } from './LanguageDrawer'

describe('LanguageDrawer (integration)', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en')
  })

  it('renders available languages and changes active language on selection', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    renderWithProviders(<LanguageDrawer open={true} onClose={onClose} />)

    expect(screen.getByText('Language')).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'English' })).toHaveAttribute(
      'data-state',
      'checked'
    )

    await user.click(screen.getByRole('radio', { name: 'Русский' }))

    expect(i18n.language).toBe('ru')
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('only closes when onOpenChange receives false', () => {
    const onClose = vi.fn()

    renderWithProviders(<LanguageDrawer open={true} onClose={onClose} />)

    fireEvent.click(screen.getByRole('button', { name: 'open-drawer' }))
    expect(onClose).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'close-drawer' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

})
