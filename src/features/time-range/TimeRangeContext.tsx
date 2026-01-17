import { createContext } from 'react'

import type { TimeRangeContextType } from './types'

export const TimeRangeContext = createContext<TimeRangeContextType | null>(null)
