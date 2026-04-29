import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'

import * as Accounts from '@/lib/api/generated/accounts/accounts'
import * as Categories from '@/lib/api/generated/categories/categories'
import * as Currencies from '@/lib/api/generated/currencies/currencies'
import * as Rates from '@/lib/api/generated/rates/rates'
import * as Settings from '@/lib/api/generated/settings/settings'
import * as Tags from '@/lib/api/generated/tags/tags'
import * as Transactions from '@/lib/api/generated/transactions/transactions'
import * as Transfers from '@/lib/api/generated/transfers/transfers'
import * as Users from '@/lib/api/generated/users/users'
import { queryClient } from '@/lib/api'
import {
  mockAccount,
  mockAccountListResponse,
  mockAccountSummary,
  mockAccountWithSummaryResponse,
} from '@/testing/data/account'
import { mockCurrency } from '@/testing/data/currency'
import { mockSettings } from '@/testing/data/settings'
import { mockUser } from '@/testing/data/user'

import { accountApi } from './account/api'
import { categoryApi } from './category/api'
import { currencyApi } from './currency/api'
import { exchangeRateApi } from './exchange-rate/api'
import { settingsApi } from './settings/api'
import { tagApi } from './tag/api'
import { transactionApi } from './transaction/api'
import { transferApi } from './transfer/api'
import { userApi } from './user/api'

describe('feature api clients (Orval-generated)', () => {
  beforeEach(() => {
    vi.spyOn(Accounts, 'accountControllerFindAll').mockResolvedValue(
      mockAccountListResponse
    )
    vi.spyOn(Accounts, 'accountControllerGetSummary').mockResolvedValue(
      mockAccountSummary
    )
    vi.spyOn(Accounts, 'accountControllerFindOne').mockResolvedValue(
      mockAccount
    )
    vi.spyOn(Accounts, 'accountControllerCreate').mockResolvedValue(
      mockAccountWithSummaryResponse
    )
    vi.spyOn(Accounts, 'accountControllerUpdate').mockResolvedValue(
      mockAccountWithSummaryResponse
    )
    vi.spyOn(Accounts, 'accountControllerToggleExcluded').mockResolvedValue(
      mockAccountWithSummaryResponse
    )
    vi.spyOn(Accounts, 'accountControllerReorder').mockResolvedValue(
      undefined as never
    )
    vi.spyOn(Accounts, 'accountControllerRemove').mockResolvedValue(
      mockAccountSummary
    )

    vi.spyOn(Categories, 'categoryControllerFindAll').mockResolvedValue(
      [] as never
    )
    vi.spyOn(Categories, 'categoryControllerFindOne').mockResolvedValue(
      {} as never
    )
    vi.spyOn(Categories, 'categoryControllerCreate').mockResolvedValue(
      {} as never
    )
    vi.spyOn(Categories, 'categoryControllerUpdate').mockResolvedValue(
      {} as never
    )
    vi.spyOn(Categories, 'categoryControllerReorder').mockResolvedValue(
      {} as never
    )

    vi.spyOn(Transactions, 'transactionControllerFindAll').mockResolvedValue(
      [] as never
    )
    vi.spyOn(Transactions, 'transactionControllerFindOne').mockResolvedValue(
      {} as never
    )
    vi.spyOn(Transactions, 'transactionControllerCreate').mockResolvedValue(
      {} as never
    )
    vi.spyOn(Transactions, 'transactionControllerUpdate').mockResolvedValue(
      {} as never
    )
    vi.spyOn(Transactions, 'transactionControllerRemove').mockResolvedValue(
      undefined as never
    )

    vi.spyOn(Transfers, 'transferControllerFindAll').mockResolvedValue(
      [] as never
    )
    vi.spyOn(Transfers, 'transferControllerFindOne').mockResolvedValue(
      {} as never
    )
    vi.spyOn(Transfers, 'transferControllerCreate').mockResolvedValue(
      {} as never
    )
    vi.spyOn(Transfers, 'transferControllerUpdate').mockResolvedValue(
      {} as never
    )
    vi.spyOn(Transfers, 'transferControllerRemove').mockResolvedValue(
      undefined as never
    )

    vi.spyOn(Tags, 'tagControllerFindAll').mockResolvedValue([] as never)
    vi.spyOn(Tags, 'tagControllerFindOne').mockResolvedValue({} as never)
    vi.spyOn(Tags, 'tagControllerCreate').mockResolvedValue({} as never)
    vi.spyOn(Tags, 'tagControllerUpdate').mockResolvedValue({} as never)
    vi.spyOn(Tags, 'tagControllerRemove').mockResolvedValue(undefined as never)

    vi.spyOn(Rates, 'rateControllerFindAll').mockResolvedValue([] as never)
    vi.spyOn(Rates, 'rateControllerFindByCode').mockResolvedValue({} as never)
    vi.spyOn(Rates, 'rateControllerFindOne').mockResolvedValue({} as never)

    vi.spyOn(Currencies, 'currencyControllerFindAll').mockResolvedValue(
      [mockCurrency] as never
    )
    vi.spyOn(Currencies, 'currencyControllerFindOne').mockResolvedValue(
      mockCurrency as never
    )

    vi.spyOn(Settings, 'settingsControllerFindOne').mockResolvedValue(
      mockSettings as never
    )
    vi.spyOn(Settings, 'settingsControllerUpdate').mockResolvedValue(
      mockSettings as never
    )

    vi.spyOn(Users, 'usersControllerChangePassword').mockResolvedValue(
      mockUser as never
    )

    vi.spyOn(queryClient, 'invalidateQueries').mockResolvedValue(
      undefined as never
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('calls account controllers and invalidate', async () => {
    await accountApi.list()
    await accountApi.summary()
    await accountApi.getById('acc-1')
    await accountApi.create({ name: 'Main' } as never)
    await accountApi.update('acc-2', { name: 'Updated' } as never)
    await accountApi.toggleExcluded('acc-3')
    await accountApi.reorder({ ids: ['acc-1', 'acc-2'] })
    await accountApi.delete('acc-4')
    await accountApi.invalidate()

    expect(Accounts.accountControllerFindAll).toHaveBeenCalledTimes(1)
    expect(Accounts.accountControllerGetSummary).toHaveBeenCalledTimes(1)
    expect(Accounts.accountControllerFindOne).toHaveBeenCalledWith('acc-1')
    expect(Accounts.accountControllerCreate).toHaveBeenCalled()
    expect(Accounts.accountControllerUpdate).toHaveBeenCalledWith(
      'acc-2',
      expect.objectContaining({ name: 'Updated' })
    )
    expect(Accounts.accountControllerToggleExcluded).toHaveBeenCalledWith(
      'acc-3'
    )
    expect(Accounts.accountControllerReorder).toHaveBeenCalled()
    expect(Accounts.accountControllerRemove).toHaveBeenCalledWith('acc-4')
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['accounts'],
    })
  })

  it('throws when account wrapper validations fail', async () => {
    vi.mocked(Accounts.accountControllerFindAll).mockResolvedValue({
      list: null,
      summary: null,
    } as never)

    await expect(accountApi.list()).rejects.toThrow(
      'Accounts response is missing required fields'
    )

    vi.mocked(Accounts.accountControllerCreate).mockResolvedValue({
      account: null,
      summary: null,
    } as never)

    await expect(
      accountApi.create({ name: 'Main' } as never)
    ).rejects.toThrow('Account response is missing required fields')
  })

  it('calls category controllers and invalidation', async () => {
    await categoryApi.list()
    await categoryApi.getById('cat-1')
    await categoryApi.create({ name: 'Food' } as never)
    await categoryApi.update('cat-2', { name: 'Rent' } as never)
    await categoryApi.reorder({ ids: ['cat-1', 'cat-2'] })
    await categoryApi.invalidate()

    expect(Categories.categoryControllerFindAll).toHaveBeenCalledTimes(1)
    expect(Categories.categoryControllerFindOne).toHaveBeenCalledWith('cat-1')
    expect(Categories.categoryControllerCreate).toHaveBeenCalled()
    expect(Categories.categoryControllerUpdate).toHaveBeenCalled()
    expect(Categories.categoryControllerReorder).toHaveBeenCalled()
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['categories'],
    })
  })

  it('calls currency/settings/user controllers', async () => {
    await currencyApi.list()
    await currencyApi.getById('currency-1')

    await settingsApi.get()
    await settingsApi.update({ account: 'account-1' })

    await userApi.changePassword('user-1', {
      currentPassword: 'old-password',
      newPassword: 'new-password',
    })

    expect(Currencies.currencyControllerFindAll).toHaveBeenCalledTimes(1)
    expect(Currencies.currencyControllerFindOne).toHaveBeenCalledWith(
      'currency-1'
    )
    expect(Settings.settingsControllerFindOne).toHaveBeenCalledTimes(1)
    expect(Settings.settingsControllerUpdate).toHaveBeenCalledTimes(1)
    expect(Users.usersControllerChangePassword).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({
        currentPassword: 'old-password',
        newPassword: 'new-password',
      })
    )
  })

  it('calls transaction controllers and passes list params', async () => {
    await transactionApi.list({ account: 'acc-1' } as never)
    await transactionApi.getById('tx-1')
    await transactionApi.create({ amount: 100 } as never)
    await transactionApi.update('tx-2', { amount: 150 } as never, {
      recalcBalance: 'true',
    })
    await transactionApi.delete('tx-3')
    await transactionApi.invalidate()

    expect(Transactions.transactionControllerFindAll).toHaveBeenCalledWith(
      expect.objectContaining({ account: 'acc-1' }),
      undefined,
      undefined
    )
    expect(Transactions.transactionControllerFindOne).toHaveBeenCalledWith(
      'tx-1'
    )
    expect(Transactions.transactionControllerCreate).toHaveBeenCalled()
    expect(Transactions.transactionControllerUpdate).toHaveBeenCalled()
    expect(Transactions.transactionControllerRemove).toHaveBeenCalledWith(
      'tx-3'
    )
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['transactions'],
    })
  })

  it('calls transfer, tag, and rate controllers', async () => {
    await transferApi.list({ account: 'acc-1' } as never)
    await transferApi.getById('tr-1')
    await transferApi.create({ from: 'a', to: 'b' } as never)
    await transferApi.update('tr-2', { fee: 1 } as never)
    await transferApi.delete('tr-3')
    await transferApi.invalidate()

    await tagApi.list()
    await tagApi.getById('tag-1')
    await tagApi.create({ name: 'Food' } as never)
    await tagApi.update('tag-2', { name: 'Travel' } as never)
    await tagApi.delete('tag-3')
    await tagApi.invalidate()

    await exchangeRateApi.list()
    await exchangeRateApi.getByCode('USD')
    await exchangeRateApi.getById('rate-1')

    expect(Transfers.transferControllerFindAll).toHaveBeenCalled()
    expect(Transfers.transferControllerUpdate).toHaveBeenCalledWith(
      'tr-2',
      expect.objectContaining({ fee: 1 })
    )
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['transfers'],
    })

    expect(Tags.tagControllerFindOne).toHaveBeenCalledWith('tag-1')
    expect(Tags.tagControllerRemove).toHaveBeenCalledWith('tag-3')
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['tags'],
    })

    expect(Rates.rateControllerFindAll).toHaveBeenCalled()
    expect(Rates.rateControllerFindByCode).toHaveBeenCalledWith('USD')
    expect(Rates.rateControllerFindOne).toHaveBeenCalledWith('rate-1')
  })
})
