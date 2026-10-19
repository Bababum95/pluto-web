import { configureStore } from '@reduxjs/toolkit'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import { queryClient } from '@/shared/api'
import exchangeRateReducer from '@/entities/exchange-rate/model/exchange-rate.slice'
import settingsReducer from '@/entities/settings/model/settings.slice'
import {
  applyTransactionDeltaToAccount,
  getSignedTransactionAmountRaw,
} from '@/entities/account/lib/transaction-balance'
import { createMockAccount } from '@/testing/data/account'
import { createMockCurrency, mockCurrency } from '@/testing/data/currency'
import { mockSettings } from '@/testing/data/settings'
import type { MoneyViewCurrencyDto } from '@/shared/lib/money/types'

import accountReducer, { updateAccount } from '../account.slice'
import { accountRepository } from '../../local/repository'
import { enqueueUpdateAccount } from '../../local/outbox-helpers'
import { accountApi } from '../api'

vi.mock('@/shared/lib/local-storage/config', () => ({
  LOCAL_DATA_MODE: 'dexie' as const,
  getLocalDataMode: (): 'dexie' | 'api-only' => 'dexie',
}))

vi.mock('../api')
vi.mock('../../local/repository')
vi.mock('../../local/outbox-helpers')
vi.mock('@/shared/api/generated/currencies/currencies', () => ({
  currencyControllerFindOne: vi.fn(),
}))

const eur: MoneyViewCurrencyDto = {
  id: 'currency-eur',
  code: 'EUR',
  symbol: '€',
  decimal_digits: 2,
}

const usd: MoneyViewCurrencyDto = {
  id: mockSettings.currency.id,
  code: mockSettings.currency.code,
  symbol: mockSettings.currency.symbol,
  decimal_digits: mockSettings.currency.decimal_digits,
}

function createDexieAccountStore(rates: Array<{
  id: string
  code: string
  value: number
  createdAt: string
  updatedAt: string
}> = []) {
  return configureStore({
    reducer: {
      account: accountReducer,
      exchangeRate: exchangeRateReducer,
      settings: settingsReducer,
    },
    preloadedState: {
      exchangeRate: {
        rates,
        status: 'success' as const,
      },
      settings: {
        settings: mockSettings,
        status: 'success' as const,
      },
    },
  })
}

describe('account.slice (dexie mode) — updateAccount', () => {
  const foreignAccount = createMockAccount({
    id: 'acc-eur',
    balance: {
      original: {
        value: 100,
        raw: 10000,
        scale: 2,
        currency: eur,
      },
      converted: {
        value: 125,
        raw: 12500,
        scale: 2,
        currency: usd,
      },
    },
  })

  const usdAccount = createMockAccount({
    id: 'acc-usd',
    name: 'Main Wallet',
    balance: {
      original: {
        value: 100,
        raw: 10000,
        scale: 2,
        currency: usd,
      },
      converted: {
        value: 100,
        raw: 10000,
        scale: 2,
        currency: usd,
      },
    },
  })

  beforeEach(() => {
    vi.clearAllMocks()
    queryClient.clear()
    vi.mocked(enqueueUpdateAccount).mockResolvedValue()
  })

  function mockAccountPersistence(account: typeof foreignAccount) {
    vi.mocked(accountRepository.getById).mockResolvedValue(account)
    vi.mocked(accountRepository.update).mockImplementation(
      async (id, data) => {
        const merged = {
          ...account,
          ...data,
          id,
        }
        vi.mocked(accountRepository.getById).mockResolvedValue(merged)
        vi.mocked(accountRepository.getAll).mockResolvedValue([merged])
      }
    )
    vi.mocked(accountRepository.getAll).mockResolvedValue([account])
  }

  it('scales converted balance from previous original when rates are missing', async () => {
    mockAccountPersistence(foreignAccount)
    const store = createDexieAccountStore()

    const result = await store.dispatch(
      updateAccount({
        id: foreignAccount.id,
        data: { balance: 8000, scale: 2 },
      })
    )

    expect(updateAccount.fulfilled.match(result)).toBe(true)
    expect(accountApi.update).not.toHaveBeenCalled()

    if (!updateAccount.fulfilled.match(result)) return

    const { account, summary } = result.payload
    // implied rate 125/100 = 1.25 → 80 EUR = 100 USD (not 125)
    expect(account.balance.original.value).toBe(80)
    expect(account.balance.converted.currency.code).toBe('USD')
    expect(account.balance.converted.value).toBe(100)
    expect(account.balance.converted.raw).toBe(10000)
    expect(summary?.total_raw).toBe(10000)
  })

  it('clears converted balance but keeps default currency when balance is zeroed', async () => {
    mockAccountPersistence(foreignAccount)
    const store = createDexieAccountStore()

    const result = await store.dispatch(
      updateAccount({
        id: foreignAccount.id,
        data: { balance: 0, scale: 2 },
      })
    )

    expect(updateAccount.fulfilled.match(result)).toBe(true)
    if (!updateAccount.fulfilled.match(result)) return

    const { account, summary } = result.payload
    expect(account.balance.original.value).toBe(0)
    expect(account.balance.converted.currency.code).toBe('USD')
    expect(account.balance.converted.value).toBe(0)
    expect(account.balance.converted.raw).toBe(0)
    expect(summary?.total_raw).toBe(0)
  })

  it('preserves stable scale on rename so a later 1.00 expense leaves 99.00', async () => {
    mockAccountPersistence(usdAccount)
    const store = createDexieAccountStore()

    // Form defaultValues use value.toString() → "100", parseDecimal → raw=100, scale=0
    const result = await store.dispatch(
      updateAccount({
        id: usdAccount.id,
        data: {
          name: 'Renamed Wallet',
          balance: 100,
          scale: 0,
          currency: usd.id,
        },
      })
    )

    expect(updateAccount.fulfilled.match(result)).toBe(true)
    if (!updateAccount.fulfilled.match(result)) return

    const renamed = result.payload.account
    expect(renamed.name).toBe('Renamed Wallet')
    expect(renamed.balance.original.scale).toBe(2)
    expect(renamed.balance.original.raw).toBe(10000)
    expect(renamed.balance.original.value).toBe(100)

    const afterExpense = applyTransactionDeltaToAccount(
      renamed,
      getSignedTransactionAmountRaw('expense', 100),
      [],
      usd
    )

    expect(afterExpense.balance.original.raw).toBe(9900)
    expect(afterExpense.balance.original.value).toBe(99)
  })

  it('resolves a new catalog currency with FX rates when no sibling account uses it', async () => {
    mockAccountPersistence(usdAccount)
    const eurCatalog = createMockCurrency({
      id: eur.id,
      code: 'EUR',
      symbol: '€',
      name: 'Euro',
      decimal_digits: 2,
    })
    queryClient.setQueryData(['currencies'], [mockCurrency, eurCatalog])

    const ts = '2024-01-01T00:00:00.000Z'
    const store = createDexieAccountStore([
      { id: 'rate-usd', code: 'USD', value: 1, createdAt: ts, updatedAt: ts },
      { id: 'rate-eur', code: 'EUR', value: 0.8, createdAt: ts, updatedAt: ts },
    ])

    const result = await store.dispatch(
      updateAccount({
        id: usdAccount.id,
        data: {
          balance: 100,
          scale: 0,
          currency: eur.id,
        },
      })
    )

    expect(updateAccount.fulfilled.match(result)).toBe(true)
    if (!updateAccount.fulfilled.match(result)) return

    const { account } = result.payload
    expect(account.balance.original.currency).toEqual({
      id: eur.id,
      code: 'EUR',
      symbol: '€',
      decimal_digits: 2,
    })
    expect(account.balance.original.currency.code).not.toBe('--')
    expect(account.balance.original.scale).toBe(2)
    expect(account.balance.original.raw).toBe(10000)
    // 100 EUR / 0.8 = 125 USD
    expect(account.balance.converted.currency.code).toBe('USD')
    expect(account.balance.converted.raw).toBe(12500)
    expect(account.balance.converted.value).toBe(125)
  })
})
