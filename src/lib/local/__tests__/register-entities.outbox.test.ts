import { describe, it, expect, beforeEach, vi } from 'vitest'

const mocks = vi.hoisted(() => {
  const fn = () => vi.fn()
  return {
    dispatch: fn(),

    // controllers
    categoryControllerFindAll: fn(),
    accountControllerFindAll: fn(),
    rateControllerFindAll: fn(),
    transactionControllerFindAll: fn(),
    transferControllerFindAll: fn(),
    authControllerGetProfile: fn(),
    settingsControllerFindOne: fn(),
    tagControllerFindAll: fn(),

    // repositories
    userRepo: { syncFromApi: fn() },
    settingsRepo: { syncFromApi: fn(), save: fn() },
    tagRepo: { syncFromApi: fn(), save: fn(), delete: fn() },
    categoryRepo: { syncFromApi: fn(), save: fn(), delete: fn() },
    accountRepo: {
      syncFromApi: fn(),
      save: fn(),
      saveMany: fn(),
      delete: fn(),
    },
    exchangeRateRepo: { syncFromApi: fn() },
    transactionRepo: { syncFromApi: fn(), save: fn(), delete: fn() },
    transferRepo: { syncFromApi: fn(), save: fn(), delete: fn() },

    // entity apis
    settingsApi: { update: fn() },
    tagApi: { create: fn(), update: fn(), delete: fn() },
    categoryApi: { create: fn(), update: fn(), delete: fn() },
    accountApi: {
      create: fn(),
      update: fn(),
      delete: fn(),
      reorder: fn(),
      toggleExcluded: fn(),
    },
    transactionApi: { create: fn(), update: fn(), delete: fn() },
    transferApi: { create: fn(), update: fn(), delete: fn() },

    // action creators
    setUser: fn(),
    clearUser: fn(),
    selectUser: fn(),
    fetchSettings: Object.assign(vi.fn(), {
      fulfilled: vi.fn((value: unknown) => ({
        type: 'settings/fulfilled',
        payload: value,
      })),
    }),
    addTag: fn(),
    removeTag: fn(),
    addCategory: fn(),
    removeCategory: fn(),
    setAccounts: fn(),
    addAccount: fn(),
    removeAccount: fn(),
    setSummary: fn(),
    updateAccountInState: fn(),
    addTransaction: fn(),
    removeTransaction: fn(),
    addTransfer: fn(),
    removeTransfer: fn(),
  }
})

vi.mock('@/store', () => ({
  store: {
    dispatch: mocks.dispatch,
    getState: vi.fn(() => ({})),
    subscribe: vi.fn(),
  },
}))

vi.mock('@/shared/api/generated/categories/categories', () => ({
  categoryControllerFindAll: mocks.categoryControllerFindAll,
}))
vi.mock('@/shared/api/generated/accounts/accounts', () => ({
  accountControllerFindAll: mocks.accountControllerFindAll,
}))
vi.mock('@/shared/api/generated/rates/rates', () => ({
  rateControllerFindAll: mocks.rateControllerFindAll,
}))
vi.mock('@/shared/api/generated/transactions/transactions', () => ({
  transactionControllerFindAll: mocks.transactionControllerFindAll,
}))
vi.mock('@/shared/api/generated/transfers/transfers', () => ({
  transferControllerFindAll: mocks.transferControllerFindAll,
}))
vi.mock('@/shared/api/generated/auth/auth', () => ({
  authControllerGetProfile: mocks.authControllerGetProfile,
}))
vi.mock('@/shared/api/generated/settings/settings', () => ({
  settingsControllerFindOne: mocks.settingsControllerFindOne,
}))
vi.mock('@/shared/api/generated/tags/tags', () => ({
  tagControllerFindAll: mocks.tagControllerFindAll,
}))

vi.mock('@/entities/user', () => ({
  userRepository: mocks.userRepo,
  userReducer: (state = null) => state,
  setUser: mocks.setUser,
  clearUser: mocks.clearUser,
  selectUser: mocks.selectUser,
}))

vi.mock('@/entities/settings', () => ({
  settingsRepository: mocks.settingsRepo,
  settingsApi: mocks.settingsApi,
  fetchSettings: mocks.fetchSettings,
}))

vi.mock('@/entities/tag', () => ({
  tagRepository: mocks.tagRepo,
  tagApi: mocks.tagApi,
  addTag: mocks.addTag,
  removeTag: mocks.removeTag,
}))

vi.mock('@/entities/category', () => ({
  categoryRepository: mocks.categoryRepo,
  categoryApi: mocks.categoryApi,
  addCategory: mocks.addCategory,
  removeCategory: mocks.removeCategory,
}))

vi.mock('@/entities/account/local', () => ({
  accountRepository: mocks.accountRepo,
}))

vi.mock('@/entities/exchange-rate/local', () => ({
  exchangeRateRepository: mocks.exchangeRateRepo,
}))

vi.mock('@/entities/account', () => ({
  accountApi: mocks.accountApi,
  setAccounts: mocks.setAccounts,
  addAccount: mocks.addAccount,
  removeAccount: mocks.removeAccount,
  setSummary: mocks.setSummary,
  updateAccountInState: mocks.updateAccountInState,
}))

vi.mock('@/entities/transaction/local', () => ({
  transactionRepository: mocks.transactionRepo,
}))

vi.mock('@/entities/transfer/local', () => ({
  transferRepository: mocks.transferRepo,
}))

vi.mock('@/entities/transaction/model/api', () => ({
  transactionApi: mocks.transactionApi,
}))

vi.mock('@/entities/transfer/model/api', () => ({
  transferApi: mocks.transferApi,
}))

vi.mock('@/entities/transaction', () => ({
  addTransaction: mocks.addTransaction,
  removeTransaction: mocks.removeTransaction,
}))

vi.mock('@/entities/transfer', () => ({
  addTransfer: mocks.addTransfer,
  removeTransfer: mocks.removeTransfer,
}))

import { syncCoordinator } from '../sync-coordinator'
import { outboxProcessor } from '../outbox-processor'
import type { OutboxRow } from '../outbox'
import { registerSyncEntities } from '../register-entities'

type OutboxHandler = (operation: OutboxRow) => Promise<void>

const capturedOutboxHandlers = new Map<string, OutboxHandler>()

vi.spyOn(outboxProcessor, 'registerHandler').mockImplementation(
  (entity: string, handler: OutboxHandler) => {
    capturedOutboxHandlers.set(entity, handler)
  }
)

type OutboxOperationInput = Pick<OutboxRow, 'entity' | 'action' | 'entityId'> &
  Partial<Pick<OutboxRow, 'payload'>>

const buildOutboxRow = (operation: OutboxOperationInput): OutboxRow => ({
  id: 'op-1',
  status: 'pending',
  attempts: 0,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  ...operation,
})

const findOutboxHandler = (
  entity: string
): ((operation: OutboxOperationInput) => Promise<void>) | undefined => {
  const handler = capturedOutboxHandlers.get(entity)
  return handler ? (operation) => handler(buildOutboxRow(operation)) : undefined
}

registerSyncEntities()

beforeEach(() => {
  vi.clearAllMocks()
})

describe('remaining sync handlers', () => {
  it('category sync calls the controller and seeds the repository', async () => {
    const apiCategories = [{ id: 'c-1', name: 'Food' }]
    mocks.categoryControllerFindAll.mockResolvedValue(apiCategories)

    await syncCoordinator.getEntityHandler('category')!()

    expect(mocks.categoryControllerFindAll).toHaveBeenCalled()
    expect(mocks.categoryRepo.syncFromApi).toHaveBeenCalledWith(apiCategories)
  })

  it('category sync wraps and rethrows controller errors', async () => {
    const err = new Error('cat boom')
    mocks.categoryControllerFindAll.mockRejectedValue(err)
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    await expect(syncCoordinator.getEntityHandler('category')!()).rejects.toBe(
      err
    )
    expect(errSpy).toHaveBeenCalledWith('Category sync failed:', err)
    errSpy.mockRestore()
  })

  it('account sync seeds the repository with response.list', async () => {
    mocks.accountControllerFindAll.mockResolvedValue({
      list: [{ id: 'a-1' }],
      summary: null,
    })

    await syncCoordinator.getEntityHandler('account')!()

    expect(mocks.accountRepo.syncFromApi).toHaveBeenCalledWith([{ id: 'a-1' }])
  })

  it('account sync defaults to empty list when response is empty', async () => {
    mocks.accountControllerFindAll.mockResolvedValue({})

    await syncCoordinator.getEntityHandler('account')!()

    expect(mocks.accountRepo.syncFromApi).toHaveBeenCalledWith([])
  })

  it('account sync wraps and rethrows controller errors', async () => {
    const err = new Error('account boom')
    mocks.accountControllerFindAll.mockRejectedValue(err)
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    await expect(syncCoordinator.getEntityHandler('account')!()).rejects.toBe(
      err
    )
    expect(errSpy).toHaveBeenCalledWith('Account sync failed:', err)
    errSpy.mockRestore()
  })

  it('exchangeRate sync hands the controller payload to the repository', async () => {
    const rates = [{ from: 'USD', to: 'EUR' }]
    mocks.rateControllerFindAll.mockResolvedValue(rates)

    await syncCoordinator.getEntityHandler('exchangeRate')!()

    expect(mocks.exchangeRateRepo.syncFromApi).toHaveBeenCalledWith(rates)
  })

  it('exchangeRate sync wraps and rethrows controller errors', async () => {
    const err = new Error('rate boom')
    mocks.rateControllerFindAll.mockRejectedValue(err)
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    await expect(
      syncCoordinator.getEntityHandler('exchangeRate')!()
    ).rejects.toBe(err)
    expect(errSpy).toHaveBeenCalledWith('ExchangeRate sync failed:', err)
    errSpy.mockRestore()
  })

  it('transaction sync hands the controller payload to the repository', async () => {
    const txs = [{ id: 'tx-1' }]
    mocks.transactionControllerFindAll.mockResolvedValue(txs)

    await syncCoordinator.getEntityHandler('transaction')!()

    expect(mocks.transactionRepo.syncFromApi).toHaveBeenCalledWith(txs)
  })

  it('transaction sync wraps and rethrows controller errors', async () => {
    const err = new Error('tx boom')
    mocks.transactionControllerFindAll.mockRejectedValue(err)
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    await expect(
      syncCoordinator.getEntityHandler('transaction')!()
    ).rejects.toBe(err)
    expect(errSpy).toHaveBeenCalledWith('Transaction sync failed:', err)
    errSpy.mockRestore()
  })

  it('transfer sync hands the controller payload to the repository', async () => {
    const trs = [{ id: 'tr-1' }]
    mocks.transferControllerFindAll.mockResolvedValue(trs)

    await syncCoordinator.getEntityHandler('transfer')!()

    expect(mocks.transferRepo.syncFromApi).toHaveBeenCalledWith(trs)
  })

  it('transfer sync wraps and rethrows controller errors', async () => {
    const err = new Error('tr boom')
    mocks.transferControllerFindAll.mockRejectedValue(err)
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    await expect(syncCoordinator.getEntityHandler('transfer')!()).rejects.toBe(
      err
    )
    expect(errSpy).toHaveBeenCalledWith('Transfer sync failed:', err)
    errSpy.mockRestore()
  })
})

describe('settings outbox handler', () => {
  it('persists the update and broadcasts via fetchSettings.fulfilled', async () => {
    const updated = { id: 'current', currency: 'USD' }
    mocks.settingsApi.update.mockResolvedValue(updated)

    await findOutboxHandler('settings')!({
      entity: 'settings',
      action: 'update',
      entityId: 'current',
      payload: { currency: 'USD' },
    })

    expect(mocks.settingsApi.update).toHaveBeenCalledWith({ currency: 'USD' })
    expect(mocks.settingsRepo.save).toHaveBeenCalledWith(updated)
    expect(mocks.fetchSettings.fulfilled).toHaveBeenCalledWith(
      updated,
      '',
      undefined
    )
    expect(mocks.dispatch).toHaveBeenCalled()
  })

  it('throws on non-update actions', async () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    await expect(
      findOutboxHandler('settings')!({
        entity: 'settings',
        action: 'create',
        entityId: 'current',
        payload: {},
      })
    ).rejects.toThrow(/Settings only supports update/)
    errSpy.mockRestore()
  })
})

describe('tag outbox handler', () => {
  it('replaces temp id and dispatches addTag on create', async () => {
    const created = { id: 'tag-1', name: 'Food' }
    mocks.tagApi.create.mockResolvedValue(created)

    await findOutboxHandler('tag')!({
      entity: 'tag',
      action: 'create',
      entityId: 'temp-1',
      payload: { name: 'Food' },
    })

    expect(mocks.tagApi.create).toHaveBeenCalled()
    expect(mocks.tagRepo.delete).toHaveBeenCalledWith('temp-1')
    expect(mocks.removeTag).toHaveBeenCalledWith('temp-1')
    expect(mocks.tagRepo.save).toHaveBeenCalledWith(created)
    expect(mocks.addTag).toHaveBeenCalledWith(created)
  })

  it('skips temp-id replacement when id is already server-side', async () => {
    const created = { id: 'tag-1', name: 'Food' }
    mocks.tagApi.create.mockResolvedValue(created)

    await findOutboxHandler('tag')!({
      entity: 'tag',
      action: 'create',
      entityId: 'tag-1',
      payload: { name: 'Food' },
    })

    expect(mocks.tagRepo.delete).not.toHaveBeenCalled()
  })

  it('saves updates and dispatches addTag', async () => {
    const updated = { id: 'tag-1', name: 'Renamed' }
    mocks.tagApi.update.mockResolvedValue(updated)

    await findOutboxHandler('tag')!({
      entity: 'tag',
      action: 'update',
      entityId: 'tag-1',
      payload: { name: 'Renamed' },
    })

    expect(mocks.tagApi.update).toHaveBeenCalledWith('tag-1', {
      name: 'Renamed',
    })
    expect(mocks.tagRepo.save).toHaveBeenCalledWith(updated)
    expect(mocks.addTag).toHaveBeenCalledWith(updated)
  })

  it('deletes via API + repo + dispatch', async () => {
    await findOutboxHandler('tag')!({
      entity: 'tag',
      action: 'delete',
      entityId: 'tag-1',
    })

    expect(mocks.tagApi.delete).toHaveBeenCalledWith('tag-1')
    expect(mocks.tagRepo.delete).toHaveBeenCalledWith('tag-1')
    expect(mocks.removeTag).toHaveBeenCalledWith('tag-1')
  })

  it('throws on unknown action', async () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    await expect(
      findOutboxHandler('tag')!({
        entity: 'tag',
        action: 'unknown',
        entityId: 'tag-1',
      } as never)
    ).rejects.toThrow(/Unknown tag action/)
    errSpy.mockRestore()
  })
})

describe('category outbox handler', () => {
  it('replaces temp id and dispatches addCategory on create', async () => {
    const created = { id: 'cat-1', name: 'Food' }
    mocks.categoryApi.create.mockResolvedValue(created)

    await findOutboxHandler('category')!({
      entity: 'category',
      action: 'create',
      entityId: 'temp-1',
      payload: { name: 'Food' },
    })

    expect(mocks.categoryApi.create).toHaveBeenCalled()
    expect(mocks.categoryRepo.delete).toHaveBeenCalledWith('temp-1')
    expect(mocks.removeCategory).toHaveBeenCalledWith('temp-1')
    expect(mocks.categoryRepo.save).toHaveBeenCalledWith(created)
    expect(mocks.addCategory).toHaveBeenCalledWith(created)
  })

  it('saves updates and dispatches addCategory', async () => {
    const updated = { id: 'cat-1', name: 'Renamed' }
    mocks.categoryApi.update.mockResolvedValue(updated)

    await findOutboxHandler('category')!({
      entity: 'category',
      action: 'update',
      entityId: 'cat-1',
      payload: { name: 'Renamed' },
    })

    expect(mocks.categoryApi.update).toHaveBeenCalledWith('cat-1', {
      name: 'Renamed',
    })
    expect(mocks.categoryRepo.save).toHaveBeenCalledWith(updated)
    expect(mocks.addCategory).toHaveBeenCalledWith(updated)
  })

  it('deletes via API + repo + dispatch', async () => {
    await findOutboxHandler('category')!({
      entity: 'category',
      action: 'delete',
      entityId: 'cat-1',
    })

    expect(mocks.categoryApi.delete).toHaveBeenCalledWith('cat-1')
    expect(mocks.categoryRepo.delete).toHaveBeenCalledWith('cat-1')
    expect(mocks.removeCategory).toHaveBeenCalledWith('cat-1')
  })

  it('throws on unknown action', async () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    await expect(
      findOutboxHandler('category')!({
        entity: 'category',
        action: 'unknown',
        entityId: 'cat-1',
      } as never)
    ).rejects.toThrow(/Unknown category action/)
    errSpy.mockRestore()
  })
})

describe('account outbox handler', () => {
  it('handles create with temp id replacement and summary dispatch', async () => {
    const created = {
      account: { id: 'acc-1' },
      summary: { total: 1 },
    }
    mocks.accountApi.create.mockResolvedValue(created)

    await findOutboxHandler('account')!({
      entity: 'account',
      action: 'create',
      entityId: 'temp-1',
      payload: { name: 'Wallet' },
    })

    expect(mocks.accountRepo.delete).toHaveBeenCalledWith('temp-1')
    expect(mocks.removeAccount).toHaveBeenCalledWith('temp-1')
    expect(mocks.accountRepo.save).toHaveBeenCalledWith(created.account)
    expect(mocks.addAccount).toHaveBeenCalledWith(created.account)
    expect(mocks.setSummary).toHaveBeenCalledWith(created.summary)
  })

  it('handles bulk-reorder updates', async () => {
    mocks.accountApi.reorder.mockResolvedValue(undefined)
    mocks.accountControllerFindAll.mockResolvedValue({
      list: [{ id: 'a-1' }],
      summary: { total: 1 },
    })

    await findOutboxHandler('account')!({
      entity: 'account',
      action: 'update',
      entityId: 'bulk-reorder',
      payload: { ids: ['a-1'] },
    })

    expect(mocks.accountApi.reorder).toHaveBeenCalledWith({ ids: ['a-1'] })
    expect(mocks.accountRepo.saveMany).toHaveBeenCalledWith([{ id: 'a-1' }])
    expect(mocks.setAccounts).toHaveBeenCalled()
    expect(mocks.setSummary).toHaveBeenCalled()
  })

  it('handles bulk-reorder when response has no summary', async () => {
    mocks.accountApi.reorder.mockResolvedValue(undefined)
    mocks.accountControllerFindAll.mockResolvedValue({})

    await findOutboxHandler('account')!({
      entity: 'account',
      action: 'update',
      entityId: 'bulk-reorder',
      payload: { ids: [] },
    })

    expect(mocks.accountRepo.saveMany).toHaveBeenCalledWith([])
    expect(mocks.setAccounts).toHaveBeenCalledWith([])
  })

  it('handles toggleExcluded updates', async () => {
    const updated = { account: { id: 'acc-1' }, summary: { total: 0 } }
    mocks.accountApi.toggleExcluded.mockResolvedValue(updated)

    await findOutboxHandler('account')!({
      entity: 'account',
      action: 'update',
      entityId: 'acc-1',
      payload: { toggleExcluded: true },
    })

    expect(mocks.accountApi.toggleExcluded).toHaveBeenCalledWith('acc-1')
    expect(mocks.accountRepo.save).toHaveBeenCalledWith(updated.account)
    expect(mocks.addAccount).toHaveBeenCalledWith(updated.account)
    expect(mocks.setSummary).toHaveBeenCalledWith(updated.summary)
  })

  it('handles generic updates', async () => {
    const updated = { account: { id: 'acc-1' }, summary: { total: 2 } }
    mocks.accountApi.update.mockResolvedValue(updated)

    await findOutboxHandler('account')!({
      entity: 'account',
      action: 'update',
      entityId: 'acc-1',
      payload: { name: 'New' },
    })

    expect(mocks.accountApi.update).toHaveBeenCalledWith('acc-1', {
      name: 'New',
    })
    expect(mocks.accountRepo.save).toHaveBeenCalledWith(updated.account)
  })

  it('handles delete and dispatches summary', async () => {
    mocks.accountApi.delete.mockResolvedValue({ total: 0 })

    await findOutboxHandler('account')!({
      entity: 'account',
      action: 'delete',
      entityId: 'acc-1',
    })

    expect(mocks.accountApi.delete).toHaveBeenCalledWith('acc-1')
    expect(mocks.accountRepo.delete).toHaveBeenCalledWith('acc-1')
    expect(mocks.removeAccount).toHaveBeenCalledWith('acc-1')
    expect(mocks.setSummary).toHaveBeenCalledWith({ total: 0 })
  })

  it('throws on unknown action', async () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    await expect(
      findOutboxHandler('account')!({
        entity: 'account',
        action: 'unknown',
        entityId: 'acc-1',
      } as never)
    ).rejects.toThrow(/Unknown account action/)
    errSpy.mockRestore()
  })
})

describe('transaction outbox handler', () => {
  it('handles create with temp id replacement + summary + account refresh', async () => {
    const response = {
      transaction: { id: 'tx-1' },
      account: { id: 'acc-1' },
      summary: { total: 1 },
    }
    mocks.transactionApi.create.mockResolvedValue(response)

    await findOutboxHandler('transaction')!({
      entity: 'transaction',
      action: 'create',
      entityId: 'temp-1',
      payload: { amount: 100 },
    })

    expect(mocks.transactionRepo.delete).toHaveBeenCalledWith('temp-1')
    expect(mocks.removeTransaction).toHaveBeenCalledWith('temp-1')
    expect(mocks.transactionRepo.save).toHaveBeenCalledWith(
      response.transaction
    )
    expect(mocks.addTransaction).toHaveBeenCalledWith(response.transaction)
    expect(mocks.updateAccountInState).toHaveBeenCalledWith(response.account)
    expect(mocks.setSummary).toHaveBeenCalledWith(response.summary)
  })

  it('handles create when response has no account or summary', async () => {
    mocks.transactionApi.create.mockResolvedValue({
      transaction: { id: 'tx-1' },
    })

    await findOutboxHandler('transaction')!({
      entity: 'transaction',
      action: 'create',
      entityId: 'tx-1',
      payload: {},
    })

    expect(mocks.updateAccountInState).not.toHaveBeenCalled()
    expect(mocks.setSummary).not.toHaveBeenCalled()
  })

  it('handles update with params payload', async () => {
    const response = {
      transaction: { id: 'tx-1' },
      account: { id: 'acc-1' },
      summary: { total: 2 },
    }
    mocks.transactionApi.update.mockResolvedValue(response)

    await findOutboxHandler('transaction')!({
      entity: 'transaction',
      action: 'update',
      entityId: 'tx-1',
      payload: { data: { amount: 200 }, params: { recalc: 'true' } },
    })

    expect(mocks.transactionApi.update).toHaveBeenCalledWith(
      'tx-1',
      { amount: 200 },
      { recalc: 'true' }
    )
    expect(mocks.transactionRepo.save).toHaveBeenCalledWith(
      response.transaction
    )
  })

  it('handles delete and refreshes accounts from API', async () => {
    mocks.accountControllerFindAll.mockResolvedValue({
      list: [{ id: 'acc-1' }],
      summary: { total: 0 },
    })

    await findOutboxHandler('transaction')!({
      entity: 'transaction',
      action: 'delete',
      entityId: 'tx-1',
    })

    expect(mocks.transactionApi.delete).toHaveBeenCalledWith('tx-1')
    expect(mocks.accountControllerFindAll).toHaveBeenCalled()
  })

  it('throws on unknown action', async () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    await expect(
      findOutboxHandler('transaction')!({
        entity: 'transaction',
        action: 'unknown',
        entityId: 'tx-1',
      } as never)
    ).rejects.toThrow(/Unknown transaction action/)
    errSpy.mockRestore()
  })
})

describe('transfer outbox handler', () => {
  it('handles create with temp id replacement + account refresh', async () => {
    const created = { id: 'tr-1' }
    mocks.transferApi.create.mockResolvedValue(created)
    mocks.accountControllerFindAll.mockResolvedValue({
      list: [],
      summary: { total: 0 },
    })

    await findOutboxHandler('transfer')!({
      entity: 'transfer',
      action: 'create',
      entityId: 'temp-1',
      payload: { amount: 100 },
    })

    expect(mocks.transferRepo.delete).toHaveBeenCalledWith('temp-1')
    expect(mocks.removeTransfer).toHaveBeenCalledWith('temp-1')
    expect(mocks.transferRepo.save).toHaveBeenCalledWith(created)
    expect(mocks.addTransfer).toHaveBeenCalledWith(created)
  })

  it('handles update + account refresh', async () => {
    const updated = { id: 'tr-1' }
    mocks.transferApi.update.mockResolvedValue(updated)
    mocks.accountControllerFindAll.mockResolvedValue({
      list: [],
      summary: { total: 0 },
    })

    await findOutboxHandler('transfer')!({
      entity: 'transfer',
      action: 'update',
      entityId: 'tr-1',
      payload: { rate: 1 },
    })

    expect(mocks.transferApi.update).toHaveBeenCalledWith('tr-1', { rate: 1 })
    expect(mocks.transferRepo.save).toHaveBeenCalledWith(updated)
    expect(mocks.addTransfer).toHaveBeenCalledWith(updated)
  })

  it('handles delete + account refresh', async () => {
    mocks.accountControllerFindAll.mockResolvedValue({
      list: [],
      summary: { total: 0 },
    })

    await findOutboxHandler('transfer')!({
      entity: 'transfer',
      action: 'delete',
      entityId: 'tr-1',
    })

    expect(mocks.transferApi.delete).toHaveBeenCalledWith('tr-1')
  })

  it('throws on unknown action', async () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    await expect(
      findOutboxHandler('transfer')!({
        entity: 'transfer',
        action: 'unknown',
        entityId: 'tr-1',
      } as never)
    ).rejects.toThrow(/Unknown transfer action/)
    errSpy.mockRestore()
  })
})
