import { createAsyncThunk } from '@reduxjs/toolkit'

import { updateSettings } from '@/entities/settings'
import type { SettingsDto } from '@/entities/settings'

/**
 * Set default account in settings.
 * This is a feature-level operation that updates settings with a new default account.
 */
export const setDefaultAccount = createAsyncThunk<SettingsDto, string>(
  'features/setDefaultAccount',
  async (accountId: string, { dispatch }) => {
    return await dispatch(updateSettings({ account: accountId })).unwrap()
  }
)
