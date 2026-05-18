import { configureStore } from '@reduxjs/toolkit'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import { createMockAccount } from '@/testing/data/account'
import { createMockSettings, mockSettings } from '@/testing/data/settings'
import { createMockCurrency } from '@/testing/data/currency'

import settingsReducer, {
  fetchSettings,
  updateSettings,
} from '../settings.slice'
import { settingsApi } from '../api'
import { settingsRepository } from '../../local/repository'
import type { UpdateSettingsDto } from '../types'

vi.mock('@/shared/lib/local-storage/config', () => ({
  LOCAL_DATA_MODE: 'dexie' as const,
  getLocalDataMode: (): 'dexie' | 'api-only' => 'dexie',
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

describe('settings.slice (dexie mode)', () => {
  let store: SettingsTestStore

  beforeEach(() => {
    store = createSettingsTestStore()
    vi.clearAllMocks()
  })

  describe('fetchSettings', () => {
    it('fetches settings from local storage when available', async () => {
      vi.mocked(settingsRepository.get).mockResolvedValue(mockSettings)

      await store.dispatch(fetchSettings())

      expect(settingsRepository.get).toHaveBeenCalled()
      expect(settingsApi.get).not.toHaveBeenCalled()
      expect(store.getState().settings.settings).toEqual(mockSettings)
      expect(store.getState().settings.status).toBe('success')
    })

    it('fetches from API and saves to local storage when local is empty', async () => {
      vi.mocked(settingsRepository.get).mockResolvedValue(null)
      vi.mocked(settingsApi.get).mockResolvedValue(mockSettings)

      await store.dispatch(fetchSettings())

      expect(settingsRepository.get).toHaveBeenCalled()
      expect(settingsApi.get).toHaveBeenCalled()
      expect(settingsRepository.save).toHaveBeenCalledWith(mockSettings)
      expect(store.getState().settings.settings).toEqual(mockSettings)
    })

    it('sets status to pending while fetching', async () => {
      vi.mocked(settingsRepository.get).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      )

      const promise = store.dispatch(fetchSettings())

      expect(store.getState().settings.status).toBe('pending')

      await promise
    })

    it('sets status to failed on error', async () => {
      vi.mocked(settingsRepository.get).mockRejectedValue(new Error('DB error'))

      await store.dispatch(fetchSettings())

      expect(store.getState().settings.status).toBe('failed')
    })
  })

  describe('updateSettings', () => {
    it('updates settings via API and saves to local storage', async () => {
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
      vi.mocked(settingsRepository.save).mockResolvedValue()

      await store.dispatch(updateSettings(updateData))

      expect(settingsApi.update).toHaveBeenCalledWith(updateData)
      expect(settingsRepository.save).toHaveBeenCalledWith(updatedSettings)
      expect(store.getState().settings.settings).toEqual(updatedSettings)
    })

    it('updates default account and syncs to local storage', async () => {
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
      vi.mocked(settingsRepository.save).mockResolvedValue()

      await store.dispatch(updateSettings(updateData))

      expect(settingsRepository.save).toHaveBeenCalledWith(updatedSettings)
      expect(store.getState().settings.settings?.account?.id).toBe('account-2')
    })
  })
})
