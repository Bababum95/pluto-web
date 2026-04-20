import { useState, useCallback, type FC } from 'react'

import { AppearanceContext } from '../AppearanceContext'
import { DEFAULT_APPEARANCE, APPEARANCE_STORAGE_KEY } from '../constants'
import type { Appearance } from '../types'

type Props = {
  children: React.ReactNode
}

export const AppearanceProvider: FC<Props> = ({ children }) => {
  const [appearance, setAppearanceState] = useState<Appearance>(() => {
    if (typeof window === 'undefined') return DEFAULT_APPEARANCE
    const stored = localStorage.getItem(APPEARANCE_STORAGE_KEY) as Appearance | null
    return stored || DEFAULT_APPEARANCE
  })

  const setAppearance = useCallback((next: Appearance) => {
    setAppearanceState(next)
    localStorage.setItem(APPEARANCE_STORAGE_KEY, next)
  }, [])

  return (
    <AppearanceContext.Provider value={{ appearance, setAppearance }}>
      {children}
    </AppearanceContext.Provider>
  )
}
