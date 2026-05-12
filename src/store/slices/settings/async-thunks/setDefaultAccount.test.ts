import { describe, expect, it, vi, beforeEach } from 'vitest'

import { setDefaultAccount } from './setDefaultAccount'

const { updateDefaultAccountMock, selectAccountByIdMock, setAccountMock } =
  vi.hoisted(() => ({
    updateDefaultAccountMock: vi.fn(),
    selectAccountByIdMock: vi.fn(),
    setAccountMock: vi.fn((account: unknown) => ({
      type: 'settings/setAccount',
      payload: account,
    })),
  }))

vi.mock('@/entities/settings', () => ({
  updateDefaultAccount: updateDefaultAccountMock,
}))

vi.mock('@/entities/account', () => ({
  selectAccountById: selectAccountByIdMock,
}))

vi.mock('../index', () => ({
  default: {},
  setAccount: setAccountMock,
}))

describe('setDefaultAccount thunk', () => {
  beforeEach(() => {
    updateDefaultAccountMock.mockClear()
    selectAccountByIdMock.mockReset()
    setAccountMock.mockClear()
  })

  it('dispatches setAccount when account exists and then updates settings', async () => {
    const account = { id: 'acc-1', name: 'Main' }
    const updatedSettings = { account: { id: 'acc-1' } }
    const state = { account: { accounts: [account] } }
    const dispatch = vi.fn((action) => action)

    selectAccountByIdMock.mockReturnValue(account)
    updateDefaultAccountMock.mockResolvedValue(updatedSettings)

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
    expect(updateDefaultAccountMock).toHaveBeenCalledWith('acc-1')
    expect(result.payload).toEqual(updatedSettings)
  })

  it('skips setAccount dispatch when account does not exist', async () => {
    const dispatch = vi.fn((action) => action)
    const state = { account: { accounts: [] } }

    selectAccountByIdMock.mockReturnValue(null)
    updateDefaultAccountMock.mockResolvedValue({ account: { id: 'acc-2' } })

    await setDefaultAccount('acc-2')(dispatch, () => state, undefined)

    expect(setAccountMock).not.toHaveBeenCalled()
    expect(dispatch).not.toHaveBeenCalledWith(
      expect.objectContaining({ type: 'settings/setAccount' })
    )
    expect(updateDefaultAccountMock).toHaveBeenCalledWith('acc-2')
  })
})
