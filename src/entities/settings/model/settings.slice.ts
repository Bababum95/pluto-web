import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from '@reduxjs/toolkit'

import { LOCAL_DATA_MODE } from '@/shared/lib/local-storage/config'

import { settingsApi } from './api'
import { settingsRepository } from '../local/repository'
import type { SettingsDto, UpdateSettingsDto } from './types'

type SettingsState = {
  settings: SettingsDto | null
  status: 'idle' | 'pending' | 'success' | 'failed'
}

const initialState: SettingsState = {
  settings: null,
  status: 'idle',
}

/**
 * Fetch settings from local storage (if available) or API.
 * In dexie mode: load from IndexedDB first, fallback to API.
 * In api-only mode: fetch directly from API.
 */
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

/**
 * Update settings via API and sync to local storage.
 * Used by features to update settings (e.g., default account, currency, language).
 */
export const updateSettings = createAsyncThunk(
  'settings/updateSettings',
  async (data: UpdateSettingsDto) => {
    const updated = await settingsApi.update(data)

    if (LOCAL_DATA_MODE === 'dexie') {
      await settingsRepository.save(updated)
    }

    return updated
  }
)

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setSettings: (state, action: PayloadAction<SettingsDto>) => {
      state.settings = action.payload
    },
    clearSettings: (state) => {
      state.settings = null
      state.status = 'idle'
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSettings.pending, (state) => {
        state.status = 'pending'
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.status = 'success'
        state.settings = action.payload
      })
      .addCase(fetchSettings.rejected, (state) => {
        state.status = 'failed'
      })
      .addCase(updateSettings.fulfilled, (state, action) => {
        state.settings = action.payload
      })
  },
})

export const { setSettings, clearSettings } = settingsSlice.actions
export default settingsSlice.reducer
