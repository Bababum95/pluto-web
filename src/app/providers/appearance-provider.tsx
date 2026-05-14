import { useCallback, useState, type ReactNode } from 'react'

import {
  AppearanceContext,
  APPEARANCE_STORAGE_KEY,
  DEFAULT_APPEARANCE,
  type Appearance,
} from '@/shared/lib/appearance'

type AppearanceProviderProps = {
  children: ReactNode
}

export function AppearanceProvider({ children }: AppearanceProviderProps) {
  const [appearance, setAppearanceState] = useState<Appearance>(() => {
    if (typeof window === 'undefined') return DEFAULT_APPEARANCE
    const stored = localStorage.getItem(
      APPEARANCE_STORAGE_KEY
    ) as Appearance | null
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
