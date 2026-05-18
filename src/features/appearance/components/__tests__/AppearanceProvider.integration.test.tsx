import userEvent from '@testing-library/user-event'
import { useContext } from 'react'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import {
  AppearanceContext,
  APPEARANCE_STORAGE_KEY,
  DEFAULT_APPEARANCE,
} from '@/shared/lib/appearance'
import { AppearanceProvider } from '@/app/providers/appearance-provider'

function AppearanceProbe() {
  const context = useContext(AppearanceContext)

  if (!context) {
    throw new Error('AppearanceContext is not available')
  }

  return (
    <div>
      <span data-testid="appearance-value">{context.appearance}</span>
      <button type="button" onClick={() => context.setAppearance('classic')}>
        to-classic
      </button>
      <button type="button" onClick={() => context.setAppearance('liquid')}>
        to-liquid
      </button>
    </div>
  )
}

describe('AppearanceProvider (integration)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('reads persisted appearance from localStorage on mount', () => {
    localStorage.setItem(APPEARANCE_STORAGE_KEY, 'classic')

    render(
      <AppearanceProvider>
        <AppearanceProbe />
      </AppearanceProvider>
    )

    expect(screen.getByTestId('appearance-value')).toHaveTextContent('classic')
  })

  it('falls back to default appearance when localStorage value is empty', () => {
    localStorage.setItem(APPEARANCE_STORAGE_KEY, '')

    render(
      <AppearanceProvider>
        <AppearanceProbe />
      </AppearanceProvider>
    )

    expect(screen.getByTestId('appearance-value')).toHaveTextContent(
      DEFAULT_APPEARANCE
    )
  })

  it('updates appearance and persists it after selection', async () => {
    const user = userEvent.setup()

    render(
      <AppearanceProvider>
        <AppearanceProbe />
      </AppearanceProvider>
    )

    expect(screen.getByTestId('appearance-value')).toHaveTextContent(
      DEFAULT_APPEARANCE
    )

    await user.click(screen.getByRole('button', { name: 'to-classic' }))

    expect(screen.getByTestId('appearance-value')).toHaveTextContent('classic')
    expect(localStorage.getItem(APPEARANCE_STORAGE_KEY)).toBe('classic')
  })
})
