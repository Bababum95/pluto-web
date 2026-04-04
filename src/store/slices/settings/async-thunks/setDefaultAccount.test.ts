import { describe, expect, it, vi, beforeEach } from 'vitest'

import { setDefaultAccount } from './setDefaultAccount'

const { updateMock, selectAccountByIdMock, setAccountMock } = vi.hoisted(() => ({
  updateMock: vi.fn(),
  selectAccountByIdMock: vi.fn(),
  setAccountMock: vi.fn((account: unknown) => ({
    type: 'settings/setAccount',
    payload: account,
  })),
}))

vi.mock('@/features/settings', () => ({
  settingsApi: {
    update: updateMock,
  },
}))

vi.mock('@/store/slices/account', () => ({
  selectAccountById: selectAccountByIdMock,
}))

vi.mock('../index', () => ({
  setAccount: setAccountMock,
}))

describe('setDefaultAccount thunk', () => {
  beforeEach(() => {
    updateMock.mockReset()
    selectAccountByIdMock.mockReset()
    setAccountMock.mockClear()
  })

  it('dispatches setAccount when account exists and then updates settings', async () => {
    const account = { id: 'acc-1', name: 'Main' }
    const updatedSettings = { account: { id: 'acc-1' } }
    const state = { account: { accounts: [account] } }
    const dispatch = vi.fn((action) => action)

    selectAccountByIdMock.mockReturnValue(account)
    updateMock.mockResolvedValue(updatedSettings)

    const result = await setDefaultAccount('acc-1')(
      dispatch,
      () => state,
      undefined
    )

    expect(selectAccountByIdMock).toHaveBeenCalledWith(state, 'acc-1')
    expect(setAccountMock).toHaveBeenCalledWith(account)
    expect(dispatch).toHaveBeenCalledWith({
      type: 'settings/setAccount',
      payload: account,
    })
    expect(updateMock).toHaveBeenCalledWith({ account: 'acc-1' })
    expect(result.payload).toEqual(updatedSettings)
  })

  it('skips setAccount dispatch when account does not exist', async () => {
    const dispatch = vi.fn((action) => action)
    const state = { account: { accounts: [] } }

    selectAccountByIdMock.mockReturnValue(null)
    updateMock.mockResolvedValue({ account: { id: 'acc-2' } })

    await setDefaultAccount('acc-2')(dispatch, () => state, undefined)

    expect(setAccountMock).not.toHaveBeenCalled()
    expect(dispatch).not.toHaveBeenCalledWith(
      expect.objectContaining({ type: 'settings/setAccount' })
    )
    expect(updateMock).toHaveBeenCalledWith({ account: 'acc-2' })
  })
})
