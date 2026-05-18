import { configureStore } from '@reduxjs/toolkit'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import { createMockAccount } from '@/testing/data/account'
import { createMockSettings, mockSettings } from '@/testing/data/settings'
import { createMockCurrency } from '@/testing/data/currency'

import settingsReducer, {
  fetchSettings,
  updateSettings,
  setSettings,
} from '../settings.slice'
import { settingsApi } from '../api'
import type { UpdateSettingsDto } from '../types'

vi.mock('@/shared/lib/local-storage/config', () => ({
  LOCAL_DATA_MODE: 'api-only' as const,
  getLocalDataMode: (): 'dexie' | 'api-only' => 'api-only',
}))

vi.mock('../api')
vi.mock('../../local/repository')

function createSettingsTestStore() {
  return configureStore({
    reducer: {
      settings: settingsReducer,
    },
  })
}

type SettingsTestStore = ReturnType<typeof createSettingsTestStore>

describe('settings.slice (api-only mode)', () => {
  let store: SettingsTestStore

  beforeEach(() => {
    store = createSettingsTestStore()
    vi.clearAllMocks()
  })

  describe('fetchSettings', () => {
    it('fetches settings from API', async () => {
      vi.mocked(settingsApi.get).mockResolvedValue(mockSettings)

      await store.dispatch(fetchSettings())

      expect(settingsApi.get).toHaveBeenCalled()
      expect(store.getState().settings.settings).toEqual(mockSettings)
      expect(store.getState().settings.status).toBe('success')
    })

    it('sets status to pending while fetching', async () => {
      vi.mocked(settingsApi.get).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      )

      const promise = store.dispatch(fetchSettings())

      expect(store.getState().settings.status).toBe('pending')

      await promise
    })

    it('sets status to failed on error', async () => {
      vi.mocked(settingsApi.get).mockRejectedValue(new Error('API error'))

      await store.dispatch(fetchSettings())

      expect(store.getState().settings.status).toBe('failed')
    })
  })

  describe('updateSettings', () => {
    it('updates settings via API', async () => {
      const updateData: UpdateSettingsDto = {
        currency: 'EUR',
      }

      const updatedSettings = createMockSettings({
        currency: createMockCurrency({
          id: 'currency-eur',
          code: 'EUR',
          symbol: '€',
          name: 'Euro',
          symbol_native: '€',
          name_plural: 'euros',
        }),
      })

      vi.mocked(settingsApi.update).mockResolvedValue(updatedSettings)

      await store.dispatch(updateSettings(updateData))

      expect(settingsApi.update).toHaveBeenCalledWith(updateData)
      expect(store.getState().settings.settings).toEqual(updatedSettings)
    })

    it('updates default account', async () => {
      store.dispatch(setSettings(mockSettings))

      const updateData: UpdateSettingsDto = {
        account: 'account-2',
      }

      const updatedSettings = createMockSettings({
        account: createMockAccount({
          id: 'account-2',
          name: 'Savings Account',
          color: '#00ff00',
          order: 1,
        }),
      })

      vi.mocked(settingsApi.update).mockResolvedValue(updatedSettings)

      await store.dispatch(updateSettings(updateData))

      expect(store.getState().settings.settings?.account?.id).toBe('account-2')
    })
  })
})
