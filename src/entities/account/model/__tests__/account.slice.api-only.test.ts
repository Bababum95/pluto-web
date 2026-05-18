import { configureStore } from '@reduxjs/toolkit'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import accountReducer, {
  fetchAccounts,
  setAccounts,
  addAccount,
  removeAccount,
} from '../account.slice'
import { accountApi } from '../api'
import {
  createMockAccount,
  mockAccount,
  mockAccountListResponse,
  mockAccountSummary,
} from '@/testing/data/account'

vi.mock('@/shared/lib/local-storage/config', () => ({
  LOCAL_DATA_MODE: 'api-only' as const,
  getLocalDataMode: (): 'dexie' | 'api-only' => 'api-only',
}))

vi.mock('../api')
vi.mock('../../local/repository')
vi.mock('../../local/outbox-helpers')

function createAccountTestStore() {
  return configureStore({
    reducer: {
      account: accountReducer,
    },
  })
}

type AccountTestStore = ReturnType<typeof createAccountTestStore>

describe('account.slice (api-only mode)', () => {
  let store: AccountTestStore

  beforeEach(() => {
    store = createAccountTestStore()
    vi.clearAllMocks()
  })

  describe('reducers', () => {
    it('setAccounts replaces all accounts', () => {
      const accounts = [mockAccount]

      store.dispatch(setAccounts(accounts))

      expect(store.getState().account.accounts).toEqual(accounts)
    })

    it('addAccount adds new account when it does not exist', () => {
      store.dispatch(addAccount(mockAccount))

      expect(store.getState().account.accounts).toHaveLength(1)
      expect(store.getState().account.accounts[0]).toEqual(mockAccount)
    })

    it('addAccount updates existing account when it exists', () => {
      store.dispatch(setAccounts([mockAccount]))

      const updatedAccount = createMockAccount({
        name: 'Updated Account',
        balance: {
          original: {
            value: 2000,
            raw: 200000,
            scale: 2,
            currency: mockAccount.balance.original.currency,
          },
          converted: {
            value: 2000,
            raw: 200000,
            scale: 2,
            currency: mockAccount.balance.converted.currency,
          },
        },
      })

      store.dispatch(addAccount(updatedAccount))

      expect(store.getState().account.accounts).toHaveLength(1)
      expect(store.getState().account.accounts[0].name).toBe('Updated Account')
      expect(store.getState().account.accounts[0].balance.converted.value).toBe(
        2000
      )
    })

    it('removeAccount removes account by id', () => {
      const secondAccount = createMockAccount({
        id: 'account-2',
        name: 'Second Account',
      })

      store.dispatch(setAccounts([mockAccount, secondAccount]))
      store.dispatch(removeAccount(mockAccount.id))

      expect(store.getState().account.accounts).toHaveLength(1)
      expect(store.getState().account.accounts[0].id).toBe('account-2')
    })
  })

  describe('fetchAccounts', () => {
    it('fetches accounts from API', async () => {
      vi.mocked(accountApi.list).mockResolvedValue(mockAccountListResponse)

      await store.dispatch(fetchAccounts())

      expect(accountApi.list).toHaveBeenCalled()
      expect(store.getState().account.accounts).toEqual([mockAccount])
      expect(store.getState().account.summary).toEqual(mockAccountSummary)
      expect(store.getState().account.status).toBe('success')
    })

    it('sets status to pending while fetching', async () => {
      vi.mocked(accountApi.list).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve(mockAccountListResponse), 100)
          )
      )

      const promise = store.dispatch(fetchAccounts())

      expect(store.getState().account.status).toBe('pending')

      await promise
    })

    it('sets status to failed on error', async () => {
      vi.mocked(accountApi.list).mockRejectedValue(new Error('API error'))

      await store.dispatch(fetchAccounts())

      expect(store.getState().account.status).toBe('failed')
    })
  })
})
