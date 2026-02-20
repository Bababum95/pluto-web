import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type { Settings } from '@/features/settings/types'
import type { Account } from '@/features/account/types'

import { setDefaultAccount, fetchSettings } from './async-thunks'

type SettingsState = {
  settings: Settings | null
  status: 'idle' | 'pending' | 'success' | 'failed'
}

const initialState: SettingsState = {
  settings: null,
  status: 'idle',
}

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setAccount: (state, action: PayloadAction<Account>) => {
      if (!state.settings) return
      state.settings.account = action.payload
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
      .addCase(setDefaultAccount.fulfilled, (state, action) => {
        state.settings = action.payload
      })
  },
})

export * from './selectors'
export * from './async-thunks'
export const { setAccount } = settingsSlice.actions
export default settingsSlice.reducer
