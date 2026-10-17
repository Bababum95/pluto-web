import { configureStore } from '@reduxjs/toolkit'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import exchangeRateReducer from '@/entities/exchange-rate/model/exchange-rate.slice'
import settingsReducer from '@/entities/settings/model/settings.slice'
import { createMockAccount } from '@/testing/data/account'
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

function createDexieAccountStore() {
  return configureStore({
    reducer: {
      account: accountReducer,
      exchangeRate: exchangeRateReducer,
      settings: settingsReducer,
    },
    preloadedState: {
      exchangeRate: {
        rates: [],
        status: 'success' as const,
      },
      settings: {
        settings: mockSettings,
        status: 'success' as const,
      },
    },
  })
}

describe('account.slice (dexie mode) — updateAccount balance conversion', () => {
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

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(accountRepository.getById).mockResolvedValue(foreignAccount)
    vi.mocked(accountRepository.update).mockImplementation(
      async (id, data) => {
        const merged = {
          ...foreignAccount,
          ...data,
          id,
        }
        vi.mocked(accountRepository.getById).mockResolvedValue(merged)
        vi.mocked(accountRepository.getAll).mockResolvedValue([merged])
      }
    )
    vi.mocked(accountRepository.getAll).mockResolvedValue([foreignAccount])
    vi.mocked(enqueueUpdateAccount).mockResolvedValue()
  })

  it('scales converted balance from previous original when rates are missing', async () => {
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
})
