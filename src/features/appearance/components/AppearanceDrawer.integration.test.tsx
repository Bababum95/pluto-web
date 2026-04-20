import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { renderWithProviders } from '@/testing/render'

import { AppearanceContext } from '../AppearanceContext'
import type { AppearanceContextType } from '../types'

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

import { AppearanceDrawer } from './AppearanceDrawer'

function renderAppearanceDrawer(contextValue: AppearanceContextType) {
  const onClose = vi.fn()

  const view = renderWithProviders(
    <AppearanceContext.Provider value={contextValue}>
      <AppearanceDrawer open={true} onClose={onClose} />
    </AppearanceContext.Provider>
  )

  return { ...view, onClose }
}

describe('AppearanceDrawer (integration)', () => {
  it('renders all appearance options with the active one selected', () => {
    renderAppearanceDrawer({
      appearance: 'liquid',
      setAppearance: vi.fn(),
    })

    expect(screen.getByText('Appearance')).toBeInTheDocument()
    expect(screen.getByText('Choose the component display style')).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Classic' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Liquid' })).toHaveAttribute(
      'data-state',
      'checked'
    )
  })

  it('updates appearance and closes the drawer after selection', async () => {
    const setAppearance = vi.fn()
    const { onClose } = renderAppearanceDrawer({
      appearance: 'classic',
      setAppearance,
    })

    fireEvent.click(screen.getByRole('radio', { name: 'Liquid' }))

    expect(setAppearance).toHaveBeenCalledWith('liquid')
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('closes the drawer when onOpenChange receives false', () => {
    const { onClose } = renderAppearanceDrawer({
      appearance: 'classic',
      setAppearance: vi.fn(),
    })

    fireEvent.click(screen.getByRole('button', { name: 'close-drawer' }))

    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
