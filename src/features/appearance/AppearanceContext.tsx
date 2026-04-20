import { createContext } from 'react'

import type { AppearanceContextType } from './types'

export const AppearanceContext = createContext<AppearanceContextType | null>(null)
