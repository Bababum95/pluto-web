import { DEFAULT_CURRENCY } from '@/features/money/constants'
import type { RootState } from '@/store'
import type { Settings } from '@/features/settings/types'

export const selectSettings = (state: RootState): Settings | null =>
  state.settings.settings

export const selectSettingsStatus = (state: RootState) => state.settings.status

export const selectCurrency = (state: RootState) =>
  state.settings.settings?.currency ?? DEFAULT_CURRENCY

export const selectDefaultAccount = (state: RootState) =>
  state.settings.settings?.account ?? null
