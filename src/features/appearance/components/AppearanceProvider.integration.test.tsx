import { useContext } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'

import { AppearanceContext } from '../AppearanceContext'
import { APPEARANCE_STORAGE_KEY, DEFAULT_APPEARANCE } from '../constants'

import { AppearanceProvider } from './AppearanceProvider'

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
