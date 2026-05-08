import { createAsyncThunk } from '@reduxjs/toolkit'

import { settingsApi } from '@/entities/settings'
import { settingsRepository } from '@/entities/settings'
import { LOCAL_DATA_MODE } from '@/lib/local/config'

export const fetchSettings = createAsyncThunk(
  'settings/fetchSettings',
  async () => {
    if (LOCAL_DATA_MODE === 'dexie') {
      // Try to load from local DB first
      const localSettings = await settingsRepository.get()

      if (localSettings) {
        return localSettings
      }

      // Fallback to API if not in local DB yet
      const apiSettings = await settingsApi.get()
      await settingsRepository.save(apiSettings)
      return apiSettings
    } else {
      // api-only mode
      return await settingsApi.get()
    }
  }
)
