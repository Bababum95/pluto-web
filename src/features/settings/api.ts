import { apiFetch } from '@/lib/api'
import type { Settings } from './types'

const BASE = 'settings'

export const settingsApi = {
  get: (): Promise<Settings> => apiFetch(BASE),
}
