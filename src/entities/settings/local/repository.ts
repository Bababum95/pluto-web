import { db } from '@/shared/lib/local-storage/db'
import { LOCAL_DATA_MODE } from '@/shared/lib/local-storage/config'

import type { SettingsDto } from '@/entities/settings'
import { settingsRowFromDto, settingsDtoFromRow } from './schema'

export const settingsRepository = {
  async get(): Promise<SettingsDto | null> {
    if (LOCAL_DATA_MODE !== 'dexie') return null

    const row = await db.settings.get('current')
    return row ? settingsDtoFromRow(row) : null
  },

  async save(settings: SettingsDto): Promise<void> {
    if (LOCAL_DATA_MODE !== 'dexie') return

    const now = new Date().toISOString()
    const row = settingsRowFromDto(settings, now)

    await db.settings.put({
      ...row,
      syncedAt: now,
    })
  },

  async syncFromApi(settings: SettingsDto): Promise<void> {
    if (LOCAL_DATA_MODE !== 'dexie') return

    await this.save(settings)
  },

  async clear(): Promise<void> {
    if (LOCAL_DATA_MODE !== 'dexie') return

    await db.settings.clear()
  },
}
