import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

import { settingsApi } from '@/features/settings'
import type { Settings } from '@/features/settings/types'
import type { RootState } from '@/store'
import { DEFAULT_CURRENCY } from '@/features/money/constants'

type SettingsState = {
  settings: Settings | null
  status: 'idle' | 'pending' | 'success' | 'failed'
}

const initialState: SettingsState = {
  settings: null,
  status: 'idle',
}

export const fetchSettings = createAsyncThunk('settings/fetchSettings', () =>
  settingsApi.get()
)

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {},
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
  },
})

export const selectSettings = (state: RootState): Settings | null =>
  state.settings.settings
export const selectSettingsStatus = (state: RootState) => state.settings.status
export const selectCurrency = (state: RootState) =>
  state.settings.settings?.currency ?? DEFAULT_CURRENCY

export default settingsSlice.reducer
