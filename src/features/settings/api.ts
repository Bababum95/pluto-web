import { apiFetch } from '@/lib/api'

import type { Settings, UpdateSettingsDto } from './types'

const BASE = 'settings'

export const settingsApi = {
  get: (): Promise<Settings> => apiFetch(BASE),
  update: (data: UpdateSettingsDto): Promise<Settings> =>
    apiFetch(BASE, { method: 'PATCH', body: JSON.stringify(data) }),
}
