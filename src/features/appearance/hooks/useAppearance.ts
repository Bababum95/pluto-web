import { useContext } from 'react'

import { AppearanceContext } from '../AppearanceContext'
import { DEFAULT_APPEARANCE } from '../constants'
import type { Appearance } from '../types'

export function useAppearance(): Appearance {
  const context = useContext(AppearanceContext)
  // Tolerant: return default when used outside provider (e.g. Storybook, isolated tests)
  return context?.appearance ?? DEFAULT_APPEARANCE
}
