import { DEFAULT_CURRENCY } from '@/shared/lib/money/constants'
import type { RootState } from '@/store'

export const selectSettings = (state: RootState) => state.settings.settings
export const selectSettingsStatus = (state: RootState) => state.settings.status
export const selectCurrency = (state: RootState) =>
  state.settings.settings?.currency ?? DEFAULT_CURRENCY
export const selectDefaultAccount = (state: RootState) =>
  state.settings.settings?.account ?? null
export const selectDefaultAccountId = (state: RootState) =>
  state.settings.settings?.account?.id ?? null
