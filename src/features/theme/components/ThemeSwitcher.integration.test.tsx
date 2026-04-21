import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { renderWithProviders } from '@/testing/render'

import { ThemeProvider } from './ThemeProvider'
import { ThemeSwitcher } from './ThemeSwitcher'

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

describe('ThemeSwitcher (integration)', () => {
  it('shows current theme options and applies a new theme', async () => {
    installMatchMedia(false)
    const user = userEvent.setup()

    renderWithProviders(
      <ThemeProvider>
        <ThemeSwitcher />
      </ThemeProvider>
    )

    await user.click(
      screen.getByRole('button', { name: 'Change theme' })
    )

    expect(screen.getByRole('menuitemradio', { name: 'Light' })).toBeVisible()
    expect(screen.getByRole('menuitemradio', { name: 'Dark' })).toBeVisible()
    expect(screen.getByRole('menuitemradio', { name: 'System' })).toBeVisible()

    await user.click(screen.getByRole('menuitemradio', { name: 'Dark' }))

    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('falls back to system option when stored theme is unknown', async () => {
    installMatchMedia(false)
    localStorage.setItem('theme', 'custom-theme')
    const user = userEvent.setup()

    renderWithProviders(
      <ThemeProvider>
        <ThemeSwitcher />
      </ThemeProvider>
    )

    await user.click(
      screen.getByRole('button', { name: 'Change theme' })
    )

    expect(screen.getByRole('menuitemradio', { name: 'System' })).toBeVisible()
  })
})
