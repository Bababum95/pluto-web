import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, beforeEach, vi } from 'vitest'

import { useTheme } from '../hooks/useTheme'
import { ThemeProvider } from './ThemeProvider'
import {
  THEME_COLOR_DARK,
  THEME_COLOR_LIGHT,
  THEME_STORAGE_KEY,
} from '../constants'

type MatchMediaController = {
  setMatches: (value: boolean) => void
}

function installMatchMedia(initial = false): MatchMediaController {
  let matches = initial
  const listeners = new Set<() => void>()

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn(() => ({
      matches,
      media: '(prefers-color-scheme: dark)',
      addEventListener: (_: 'change', cb: () => void) => {
        listeners.add(cb)
      },
      removeEventListener: (_: 'change', cb: () => void) => {
        listeners.delete(cb)
      },
    })),
  })

  return {
    setMatches(next: boolean) {
      matches = next
      listeners.forEach((listener) => listener())
    },
  }
}

function ThemeProbe() {
  const { theme, setTheme } = useTheme()

  return (
    <div>
      <span data-testid="theme-value">{theme}</span>
      <button type="button" onClick={() => setTheme('light')}>
        to-light
      </button>
      <button type="button" onClick={() => setTheme('dark')}>
        to-dark
      </button>
      <button type="button" onClick={() => setTheme('system')}>
        to-system
      </button>
    </div>
  )
}

describe('ThemeProvider (integration)', () => {
  beforeEach(() => {
    document.documentElement.classList.remove('dark')
    localStorage.clear()
    document.head.innerHTML = '<meta name="theme-color" content="#ffffff" />'
  })

  it('reads persisted theme and applies dark class + meta color', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark')
    installMatchMedia(false)

    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>
    )

    expect(screen.getByTestId('theme-value')).toHaveTextContent('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(document.querySelector('meta[name="theme-color"]')).toHaveAttribute(
      'content',
      THEME_COLOR_DARK
    )
  })

  it('persists manual theme switch and updates theme-color meta', async () => {
    installMatchMedia(false)
    const user = userEvent.setup()

    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>
    )

    await user.click(screen.getByRole('button', { name: 'to-light' }))

    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(document.querySelector('meta[name="theme-color"]')).toHaveAttribute(
      'content',
      THEME_COLOR_LIGHT
    )
  })

  it('reacts to system theme changes when selected theme is system', async () => {
    const media = installMatchMedia(false)
    const user = userEvent.setup()

    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>
    )

    await user.click(screen.getByRole('button', { name: 'to-system' }))

    act(() => {
      media.setMatches(true)
    })

    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(document.querySelector('meta[name="theme-color"]')).toHaveAttribute(
      'content',
      THEME_COLOR_DARK
    )
  })
})
