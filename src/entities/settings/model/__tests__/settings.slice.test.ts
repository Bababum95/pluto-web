import { configureStore } from '@reduxjs/toolkit'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import settingsReducer, {
  setSettings,
  clearSettings,
} from '../settings.slice'
import { mockSettings } from '@/testing/data/settings'

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

describe('settings.slice', () => {
  let store: SettingsTestStore

  beforeEach(() => {
    store = createSettingsTestStore()
    vi.clearAllMocks()
  })

  describe('reducers', () => {
    it('setSettings sets the settings', () => {
      store.dispatch(setSettings(mockSettings))

      expect(store.getState().settings.settings).toEqual(mockSettings)
    })

    it('clearSettings clears settings and resets status', () => {
      store.dispatch(setSettings(mockSettings))
      store.dispatch(clearSettings())

      expect(store.getState().settings.settings).toBeNull()
      expect(store.getState().settings.status).toBe('idle')
    })
  })
})
