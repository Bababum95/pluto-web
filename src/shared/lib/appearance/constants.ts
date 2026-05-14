import type { Appearance } from './types'

export const APPEARANCES = ['classic', 'liquid'] as const
export const APPEARANCE_STORAGE_KEY = 'appearance'
export const DEFAULT_APPEARANCE: Appearance = 'liquid'
