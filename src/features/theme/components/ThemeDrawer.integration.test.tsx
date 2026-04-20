import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { renderWithProviders } from '@/testing/render'

vi.mock('@/components/ui/drawer', () => ({
  Drawer: ({
    children,
    open,
    onOpenChange,
  }: {
    children: React.ReactNode
    open: boolean
    onOpenChange?: (open: boolean) => void
  }) => (
    <div data-testid="mock-drawer" data-open={open}>
      <button type="button" onClick={() => onOpenChange?.(true)}>
        keep-open
      </button>
      <button type="button" onClick={() => onOpenChange?.(false)}>
        close-drawer
      </button>
      {open ? children : null}
    </div>
  ),
  DrawerContent: ({ children, ...props }: React.ComponentProps<'div'>) => (
    <div {...props}>{children}</div>
  ),
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
}))

import { ThemeProvider } from './ThemeProvider'
import { ThemeDrawer } from './ThemeDrawer'
import { THEME_STORAGE_KEY } from '../constants'

function installMatchMedia(initial = false) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn(() => ({
      matches: initial,
      media: '(prefers-color-scheme: dark)',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  })
}

describe('ThemeDrawer (integration)', () => {
  it('selects a theme and closes the drawer', async () => {
    installMatchMedia(false)
    const onClose = vi.fn()

    renderWithProviders(
      <ThemeProvider>
        <ThemeDrawer open onClose={onClose} />
      </ThemeProvider>
    )

    expect(screen.getByText('Theme')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('radio', { name: 'Dark' }))

    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when drawer requests closing', () => {
    installMatchMedia(false)
    const onClose = vi.fn()

    renderWithProviders(
      <ThemeProvider>
        <ThemeDrawer open onClose={onClose} />
      </ThemeProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: 'close-drawer' }))

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not close when drawer reports open=true', () => {
    installMatchMedia(false)
    const onClose = vi.fn()

    renderWithProviders(
      <ThemeProvider>
        <ThemeDrawer open onClose={onClose} />
      </ThemeProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: 'keep-open' }))

    expect(onClose).not.toHaveBeenCalled()
  })
})
