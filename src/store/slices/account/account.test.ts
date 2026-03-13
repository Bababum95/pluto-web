import { describe, it, expect, vi } from 'vitest'

vi.mock('@/store', () => ({
  createStore: vi.fn(() => ({ getState: vi.fn(() => ({})) })),
}))

import accountReducer, {
  accountSlice,
  fetchAccounts,
  deleteAccount,
  createAccount,
  updateAccount,
  reorderAccounts,
  toggleExcluded,
  setAccounts,
  addAccount,
  setSummary,
  removeAccount,
} from './index'
import {
  createTransaction,
  updateTransaction,
} from '@/store/slices/transaction'
import {
  mockAccount,
  mockAccountSummary,
  createMockAccount,
} from '@/testing/data/account'

const account2 = createMockAccount({
  id: 'account-2',
  name: 'Second',
  order: 2,
})

describe('account slice', () => {
  describe('reducers', () => {
    it('setAccounts replaces list', () => {
      const state = accountReducer(
        undefined,
        setAccounts([mockAccount, account2])
      )
      expect(state.accounts).toHaveLength(2)
      expect(state.accounts[0].id).toBe(mockAccount.id)
      expect(state.accounts[1].id).toBe('account-2')
    })

    it('addAccount appends account', () => {
      let state = accountReducer(undefined, setAccounts([mockAccount]))
      state = accountReducer(state, addAccount(account2))
      expect(state.accounts).toHaveLength(2)
      expect(state.accounts[1].name).toBe('Second')
    })

    it('updateAccount (sync) updates existing account by id', () => {
      let state = accountReducer(
        undefined,
        setAccounts([mockAccount, account2])
      )
      const updated = createMockAccount({
        id: mockAccount.id,
        name: 'Updated Wallet',
      })
      state = accountReducer(state, accountSlice.actions.updateAccount(updated))
      expect(state.accounts[0].name).toBe('Updated Wallet')
      expect(state.accounts[1]).toEqual(account2)
    })

    it('updateAccount (sync) does nothing when id not in list', () => {
      let state = accountReducer(undefined, setAccounts([mockAccount]))
      const unknown = createMockAccount({ id: 'unknown' })
      state = accountReducer(state, accountSlice.actions.updateAccount(unknown))
      expect(state.accounts).toHaveLength(1)
      expect(state.accounts[0].id).toBe(mockAccount.id)
    })

    it('setSummary sets summary', () => {
      const state = accountReducer(undefined, setSummary(mockAccountSummary))
      expect(state.summary).toEqual(mockAccountSummary)
    })

    it('setSummary can set null', () => {
      let state = accountReducer(undefined, setSummary(mockAccountSummary))
      state = accountReducer(state, setSummary(null))
      expect(state.summary).toBeNull()
    })

    it('removeAccount removes by id', () => {
      let state = accountReducer(
        undefined,
        setAccounts([mockAccount, account2])
      )
      state = accountReducer(state, removeAccount(mockAccount.id))
      expect(state.accounts).toHaveLength(1)
      expect(state.accounts[0].id).toBe('account-2')
    })
  })

  describe('fetchAccounts', () => {
    it('pending sets status to pending', () => {
      const state = accountReducer(
        undefined,
        fetchAccounts.pending('req-1', undefined)
      )
      expect(state.status).toBe('pending')
    })

    it('fulfilled sets accounts and summary', () => {
      const list = [mockAccount, account2]
      const action = fetchAccounts.fulfilled(
        { list, summary: mockAccountSummary },
        'req-1',
        undefined
      )
      const state = accountReducer(undefined, action)
      expect(state.status).toBe('success')
      expect(state.accounts).toEqual(list)
      expect(state.summary).toEqual(mockAccountSummary)
    })

    it('rejected sets status to failed', () => {
      const state = accountReducer(
        undefined,
        fetchAccounts.rejected(new Error('fail'), 'req-1', undefined)
      )
      expect(state.status).toBe('failed')
    })
  })

  describe('deleteAccount', () => {
    it('pending sets status to pending', () => {
      const state = accountReducer(
        undefined,
        deleteAccount.pending('req-1', 'account-1')
      )
      expect(state.status).toBe('pending')
    })

    it('fulfilled removes account by meta.arg and sets summary', () => {
      const newSummary = { ...mockAccountSummary, total_raw: 0 }
      let state = accountReducer(
        undefined,
        fetchAccounts.fulfilled(
          { list: [mockAccount, account2], summary: mockAccountSummary },
          'req-1',
          undefined
        )
      )
      const action = deleteAccount.fulfilled(
        newSummary,
        'req-1',
        mockAccount.id
      )
      state = accountReducer(state, action)
      expect(state.status).toBe('success')
      expect(state.accounts).toHaveLength(1)
      expect(state.accounts[0].id).toBe('account-2')
      expect(state.summary).toEqual(newSummary)
    })
  })

  describe('createAccount', () => {
    it('fulfilled appends account and sets summary', () => {
      const newAccount = createMockAccount({ id: 'account-new', name: 'New' })
      const action = createAccount.fulfilled(
        { account: newAccount, summary: mockAccountSummary },
        'req-1',
        {} as never
      )
      let state = accountReducer(undefined, setAccounts([mockAccount]))
      state = accountReducer(state, action)
      expect(state.accounts).toHaveLength(2)
      expect(state.accounts[1]).toEqual(newAccount)
      expect(state.summary).toEqual(mockAccountSummary)
    })
  })

  describe('updateAccount (thunk)', () => {
    it('fulfilled updates account in list and summary via applyAccountUpdate', () => {
      const updated = createMockAccount({
        id: mockAccount.id,
        name: 'Updated Name',
      })
      const newSummary = { ...mockAccountSummary, total_raw: 90000 }
      let state = accountReducer(
        undefined,
        fetchAccounts.fulfilled(
          { list: [mockAccount, account2], summary: mockAccountSummary },
          'req-1',
          undefined
        )
      )
      const action = updateAccount.fulfilled(
        { account: updated, summary: newSummary },
        'req-1',
        { id: mockAccount.id, data: {} as never }
      )
      state = accountReducer(state, action)
      expect(state.accounts[0].name).toBe('Updated Name')
      expect(state.accounts[1]).toEqual(account2)
      expect(state.summary).toEqual(newSummary)
    })
  })

  describe('createTransaction.fulfilled', () => {
    it('applyAccountUpdate updates matching accounts and summary', () => {
      const updatedAccount = createMockAccount({
        id: mockAccount.id,
        name: 'After Transaction',
      })
      let state = accountReducer(
        undefined,
        fetchAccounts.fulfilled(
          { list: [mockAccount], summary: mockAccountSummary },
          'req-1',
          undefined
        )
      )
      const action = createTransaction.fulfilled(
        {
          transaction: {} as never,
          insert: true,
          accounts: [updatedAccount],
          summary: mockAccountSummary,
        },
        'req-1',
        {} as never
      )
      state = accountReducer(state, action)
      expect(state.accounts[0].name).toBe('After Transaction')
      expect(state.summary).toEqual(mockAccountSummary)
    })

    it('handles empty accounts array and null summary leaves summary unchanged', () => {
      let state = accountReducer(
        undefined,
        fetchAccounts.fulfilled(
          { list: [mockAccount], summary: mockAccountSummary },
          'req-1',
          undefined
        )
      )
      const action = createTransaction.fulfilled(
        {
          transaction: {} as never,
          insert: false,
          accounts: [],
          summary: null as never,
        },
        'req-1',
        {} as never
      )
      state = accountReducer(state, action)
      expect(state.accounts[0]).toEqual(mockAccount)
      expect(state.summary).toEqual(mockAccountSummary)
    })
  })

  describe('updateTransaction.fulfilled', () => {
    it('applyAccountUpdate updates matching accounts and summary', () => {
      const updatedAccount = createMockAccount({
        id: mockAccount.id,
        name: 'After Update',
      })
      let state = accountReducer(
        undefined,
        fetchAccounts.fulfilled(
          { list: [mockAccount], summary: mockAccountSummary },
          'req-1',
          undefined
        )
      )
      const action = updateTransaction.fulfilled(
        {
          transaction: {} as never,
          accounts: [updatedAccount],
          summary: mockAccountSummary,
        },
        'req-1',
        {} as never
      )
      state = accountReducer(state, action)
      expect(state.accounts[0].name).toBe('After Update')
    })
  })

  describe('reorderAccounts', () => {
    it('fulfilled reorders by ids and sets order field', () => {
      let state = accountReducer(
        undefined,
        fetchAccounts.fulfilled(
          {
            list: [
              { ...mockAccount, id: 'a', order: 0 },
              { ...account2, id: 'b', order: 1 },
            ],
            summary: mockAccountSummary,
          },
          'req-1',
          undefined
        )
      )
      const action = reorderAccounts.fulfilled(undefined, 'req-1', ['b', 'a'])
      state = accountReducer(state, action)
      expect(state.accounts).toHaveLength(2)
      expect(state.accounts[0].id).toBe('b')
      expect(state.accounts[0].order).toBe(0)
      expect(state.accounts[1].id).toBe('a')
      expect(state.accounts[1].order).toBe(1)
    })

    it('fulfilled drops ids not in current accounts', () => {
      let state = accountReducer(
        undefined,
        fetchAccounts.fulfilled(
          {
            list: [{ ...mockAccount, id: 'a', order: 0 }],
            summary: mockAccountSummary,
          },
          'req-1',
          undefined
        )
      )
      const action = reorderAccounts.fulfilled(undefined, 'req-1', [
        'a',
        'missing',
      ])
      state = accountReducer(state, action)
      expect(state.accounts).toHaveLength(1)
      expect(state.accounts[0].id).toBe('a')
      expect(state.accounts[0].order).toBe(0)
    })
  })

  describe('toggleExcluded', () => {
    it('fulfilled updates account and summary via applyAccountUpdate', () => {
      const toggled = createMockAccount({
        id: mockAccount.id,
        excluded: true,
      })
      let state = accountReducer(
        undefined,
        fetchAccounts.fulfilled(
          { list: [mockAccount], summary: mockAccountSummary },
          'req-1',
          undefined
        )
      )
      const action = toggleExcluded.fulfilled(
        { account: toggled, summary: mockAccountSummary },
        'req-1',
        mockAccount.id
      )
      state = accountReducer(state, action)
      expect(state.accounts[0].excluded).toBe(true)
      expect(state.summary).toEqual(mockAccountSummary)
    })
  })
})
