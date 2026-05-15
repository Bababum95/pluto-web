import { beforeEach, describe, it, expect, vi } from 'vitest'

import { mockAccount, mockAccountSummary } from '@/testing/data/account'
import { updateAccountInState, setSummary } from '@/entities/account'
import { applyTransactionMutationSideEffects } from '../apply-transaction-mutation-side-effects'

vi.mock('@/entities/account', () => ({
  updateAccountInState: vi.fn((account: unknown) => ({
    type: 'account/updateAccountInState',
    payload: account,
  })),
  setSummary: vi.fn((summary: unknown) => ({
    type: 'account/setSummary',
    payload: summary,
  })),
}))

describe('applyTransactionMutationSideEffects', () => {
  beforeEach(() => {
    vi.mocked(updateAccountInState).mockClear()
    vi.mocked(setSummary).mockClear()
  })

  it('dispatches updateAccountInState for each account and setSummary when present', () => {
    const dispatch = vi.fn()
    const secondAccount = { ...mockAccount, id: 'account-2', name: 'Savings' }

    applyTransactionMutationSideEffects(dispatch, {
      accounts: [mockAccount, secondAccount],
      summary: mockAccountSummary,
    })

    expect(updateAccountInState).toHaveBeenCalledTimes(2)
    expect(updateAccountInState).toHaveBeenNthCalledWith(1, mockAccount)
    expect(updateAccountInState).toHaveBeenNthCalledWith(2, secondAccount)
    expect(setSummary).toHaveBeenCalledWith(mockAccountSummary)
    expect(dispatch).toHaveBeenCalledTimes(3)
  })

  it('skips account and summary dispatches when omitted', () => {
    const dispatch = vi.fn()

    applyTransactionMutationSideEffects(dispatch, {})

    expect(updateAccountInState).not.toHaveBeenCalled()
    expect(setSummary).not.toHaveBeenCalled()
    expect(dispatch).not.toHaveBeenCalled()
  })
})
