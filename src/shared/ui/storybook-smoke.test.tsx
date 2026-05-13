import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import * as DialogStories from './dialog/dialog.stories'
import * as DrawerStories from './drawer/drawer.stories'
import * as SheetStories from './sheet/sheet.stories'
import PasswordMeta, * as PasswordStories from './password-input/password-input.stories'

beforeAll(() => {
  if (typeof window.matchMedia === 'function') return

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(() => ({
      matches: false,
      media: '(prefers-color-scheme: light)',
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
})

describe('storybook stories smoke', () => {
  it('opens dialog story content', async () => {
    const user = userEvent.setup()
    render(DialogStories.Default.render?.({}, {} as never) ?? null)

    await user.click(screen.getByRole('button', { name: 'Edit Profile' }))
    expect(screen.getByText('Edit profile')).toBeInTheDocument()
  })

  it('opens drawer story content', async () => {
    const user = userEvent.setup()
    render(DrawerStories.Bottom.render?.({}, {} as never) ?? null)

    await user.click(screen.getByRole('button', { name: 'Open Drawer' }))
    expect(screen.getByText('Drawer Title')).toBeInTheDocument()
  })

  it('opens sheet story content', async () => {
    const user = userEvent.setup()
    render(SheetStories.Right.render?.({}, {} as never) ?? null)

    await user.click(screen.getByRole('button', { name: 'Open Sheet' }))
    expect(screen.getByText('Sheet Title')).toBeInTheDocument()
  })

  it('renders password input story args and toggles visibility', async () => {
    const user = userEvent.setup()
    const Component = PasswordMeta.component

    if (!Component) {
      throw new Error('PasswordInput story component is not defined')
    }

    render(<Component {...PasswordStories.Default.args} />)

    const input = screen.getByPlaceholderText('Enter password...')
    expect(input).toHaveAttribute('type', 'password')

    await user.click(screen.getByRole('button', { name: 'Show password' }))
    expect(input).toHaveAttribute('type', 'text')
  })
})
