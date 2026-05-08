import { createAsyncThunk } from '@reduxjs/toolkit'

import { LOCAL_DATA_MODE } from '@/lib/local/config'

import { settingsApi } from './api'
import { settingsRepository } from '../local/repository'

export const fetchSettings = createAsyncThunk(
  'settings/fetchSettings',
  async () => {
    if (LOCAL_DATA_MODE === 'dexie') {
      const localSettings = await settingsRepository.get()

      if (localSettings) return localSettings

      const apiSettings = await settingsApi.get()
      await settingsRepository.save(apiSettings)
      return apiSettings
    }

    return await settingsApi.get()
  }
)
