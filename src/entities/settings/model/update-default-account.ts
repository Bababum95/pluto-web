import { LOCAL_DATA_MODE } from '@/lib/local/config'

import type { SettingsDto } from './types'
import { settingsApi } from './api'
import { settingsRepository } from '../local/repository'

export async function updateDefaultAccount(id: string): Promise<SettingsDto> {
  const updated = await settingsApi.update({ account: id })

  if (LOCAL_DATA_MODE === 'dexie') {
    await settingsRepository.save(updated)
  }

  return updated
}
