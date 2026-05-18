import { describe, it, expect } from 'vitest'
import { configureStore } from '@reduxjs/toolkit'

import { createMockSettings, mockSettings } from '@/testing/data/settings'
import { DEFAULT_CURRENCY } from '@/shared/lib/money/constants'
import type { RootState } from '@/app/store'

import settingsReducer, { setSettings } from '../settings.slice'
import {
  selectSettings,
  selectSettingsStatus,
  selectCurrency,
  selectDefaultAccount,
  selectDefaultAccountId,
} from '../selectors'

function settingsState(settings: RootState['settings']): RootState['settings'] {
  return settings
}

function state(settings: RootState['settings']): RootState {
  return { settings } as RootState
}

function createSettingsTestStore() {
  return configureStore({
    reducer: {
      settings: settingsReducer,
    },
  })
}

describe('settings selectors', () => {
  it('selectSettings returns settings', () => {
    const store = createSettingsTestStore()

    store.dispatch(setSettings(mockSettings))

    expect(selectSettings(state(store.getState().settings))).toEqual(
      mockSettings
    )
  })

  it('selectSettings returns null when no settings', () => {
    const store = createSettingsTestStore()

    expect(
      selectSettings(state(settingsState(store.getState().settings)))
    ).toBeNull()
  })

  it('selectSettingsStatus returns status', () => {
    const store = createSettingsTestStore()

    expect(
      selectSettingsStatus(state(settingsState(store.getState().settings)))
    ).toBe('idle')
  })

  it('selectCurrency returns currency from settings', () => {
    const store = createSettingsTestStore()

    store.dispatch(setSettings(mockSettings))

    expect(selectCurrency(state(store.getState().settings))).toEqual(
      mockSettings.currency
    )
  })

  it('selectCurrency returns default currency when no settings', () => {
    const store = createSettingsTestStore()

    expect(
      selectCurrency(state(settingsState(store.getState().settings)))
    ).toEqual(DEFAULT_CURRENCY)
  })

  it('selectDefaultAccount returns account from settings', () => {
    const store = createSettingsTestStore()

    store.dispatch(setSettings(mockSettings))

    expect(selectDefaultAccount(state(store.getState().settings))).toEqual(
      mockSettings.account
    )
  })

  it('selectDefaultAccount returns null when no settings', () => {
    const store = createSettingsTestStore()

    expect(
      selectDefaultAccount(state(settingsState(store.getState().settings)))
    ).toBeNull()
  })

  it('selectDefaultAccount returns null when settings has no account', () => {
    const store = createSettingsTestStore()

    const settingsWithoutAccount = createMockSettings({ account: null })

    store.dispatch(setSettings(settingsWithoutAccount))

    expect(selectDefaultAccount(state(store.getState().settings))).toBeNull()
  })

  it('selectDefaultAccountId returns account id from settings', () => {
    const store = createSettingsTestStore()

    store.dispatch(setSettings(mockSettings))

    expect(selectDefaultAccountId(state(store.getState().settings))).toBe(
      'account-1'
    )
  })

  it('selectDefaultAccountId returns null when no settings', () => {
    const store = createSettingsTestStore()

    expect(
      selectDefaultAccountId(state(settingsState(store.getState().settings)))
    ).toBeNull()
  })

  it('selectDefaultAccountId returns null when settings has no account', () => {
    const store = createSettingsTestStore()

    const settingsWithoutAccount = createMockSettings({ account: null })

    store.dispatch(setSettings(settingsWithoutAccount))

    expect(selectDefaultAccountId(state(store.getState().settings))).toBeNull()
  })
})
