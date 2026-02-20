import { createAsyncThunk } from '@reduxjs/toolkit'

import { settingsApi } from '@/features/settings'

export const fetchSettings = createAsyncThunk(
  'settings/fetchSettings',
  async () => {
    return await settingsApi.get()
  }
)
