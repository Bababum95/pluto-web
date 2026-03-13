import { describe, it, expect, vi } from 'vitest'

vi.mock('@/store', () => ({
  createStore: vi.fn(() => ({ getState: vi.fn(() => ({})) })),
}))

import settingsReducer, {
  fetchSettings,
  setDefaultAccount,
  setAccount,
} from './index'
import {
  selectSettings,
  selectSettingsStatus,
  selectCurrency,
  selectDefaultAccount,
} from './selectors'
import type { RootState } from '@/store'
import { mockSettings, createMockSettings } from '@/testing/data/settings'
import { mockAccount, createMockAccount } from '@/testing/data/account'
import { mockCurrency } from '@/testing/data/currency'

describe('settings slice', () => {
  describe('reducers', () => {
    it('setAccount updates account when settings exists', () => {
      const otherAccount = createMockAccount({
        id: 'account-2',
        name: 'Savings',
      })
      let state = settingsReducer(
        undefined,
        fetchSettings.fulfilled(mockSettings, 'req-1', undefined)
      )
      state = settingsReducer(state, setAccount(otherAccount))
      expect(state.settings?.account).toEqual(otherAccount)
    })

    it('setAccount does nothing when settings is null', () => {
      const state = settingsReducer(undefined, setAccount(mockAccount))
      expect(state.settings).toBeNull()
    })
  })

  describe('fetchSettings', () => {
    it('pending sets status to pending', () => {
      const state = settingsReducer(
        undefined,
        fetchSettings.pending('req-1', undefined)
      )
      expect(state.status).toBe('pending')
    })

    it('fulfilled sets settings', () => {
      const action = fetchSettings.fulfilled(mockSettings, 'req-1', undefined)
      const state = settingsReducer(undefined, action)
      expect(state.status).toBe('success')
      expect(state.settings).toEqual(mockSettings)
    })

    it('rejected sets status to failed', () => {
      const state = settingsReducer(
        undefined,
        fetchSettings.rejected(new Error('fail'), 'req-1', undefined)
      )
      expect(state.status).toBe('failed')
    })
  })

  describe('setDefaultAccount', () => {
    it('fulfilled replaces settings with payload', () => {
      const updatedSettings = createMockSettings({
        account: createMockAccount({ id: 'account-2', name: 'New Default' }),
      })
      let state = settingsReducer(
        undefined,
        fetchSettings.fulfilled(mockSettings, 'req-1', undefined)
      )
      const action = setDefaultAccount.fulfilled(
        updatedSettings,
        'req-1',
        'account-2'
      )
      state = settingsReducer(state, action)
      expect(state.settings).toEqual(updatedSettings)
      expect(state.settings?.account?.id).toBe('account-2')
    })

    it('rejected leaves settings unchanged (no handler)', () => {
      let state = settingsReducer(
        undefined,
        fetchSettings.fulfilled(mockSettings, 'req-1', undefined)
      )
      const action = setDefaultAccount.rejected(
        new Error('API error'),
        'req-1',
        'account-2'
      )
      state = settingsReducer(state, action)
      expect(state.settings).toEqual(mockSettings)
    })
  })
})

describe('settings selectors', () => {
  function state(s: RootState['settings']): RootState {
    return { settings: s } as RootState
  }

  it('selectSettings returns settings', () => {
    const s = state({
      settings: mockSettings,
      status: 'success',
    })
    expect(selectSettings(s)).toEqual(mockSettings)
  })

  it('selectSettingsStatus returns status', () => {
    expect(
      selectSettingsStatus(state({ settings: null, status: 'pending' }))
    ).toBe('pending')
  })

  it('selectCurrency returns settings.currency or DEFAULT_CURRENCY', () => {
    const s = state({
      settings: mockSettings,
      status: 'success',
    })
    expect(selectCurrency(s)).toEqual(mockCurrency)
    expect(selectCurrency(state({ settings: null, status: 'idle' }))).toEqual(
      expect.objectContaining({ code: 'USD' })
    )
  })

  it('selectDefaultAccount returns settings.account or null', () => {
    const s = state({
      settings: mockSettings,
      status: 'success',
    })
    expect(selectDefaultAccount(s)).toEqual(mockAccount)
    expect(
      selectDefaultAccount(state({ settings: null, status: 'idle' }))
    ).toBeNull()
  })
})
