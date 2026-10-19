import { describe, it, expect, vi, beforeEach } from 'vitest'

import { queryClient } from '@/shared/api'
import { mockCurrency, createMockCurrency } from '@/testing/data/currency'
import { mockAccount } from '@/testing/data/account'

import {
  resolveMoneyViewCurrencyForAccountUpdate,
  resolveMoneyViewCurrencyForTempAccount,
} from '../temp-account-currency'

vi.mock('@/shared/api/generated/currencies/currencies', () => ({
  currencyControllerFindOne: vi.fn(),
}))

import { currencyControllerFindOne } from '@/shared/api/generated/currencies/currencies'

describe('resolveMoneyViewCurrencyForTempAccount', () => {
  it('uses settings currency when id matches', () => {
    const getState = () =>
      ({
        settings: {
          settings: {
            currency: mockCurrency,
          },
        },
        account: { accounts: [] },
      }) as never

    const result = resolveMoneyViewCurrencyForTempAccount(
      mockCurrency.id,
      2,
      getState
    )

    expect(result).toEqual({
      id: mockCurrency.id,
      code: mockCurrency.code,
      symbol: mockCurrency.symbol,
      decimal_digits: mockCurrency.decimal_digits,
    })
  })

  it('uses currency from an existing account when settings id differs', () => {
    const getState = () =>
      ({
        settings: {
          settings: {
            currency: { ...mockCurrency, id: 'other-currency' },
          },
        },
        account: {
          accounts: [mockAccount],
        },
      }) as never

    const result = resolveMoneyViewCurrencyForTempAccount(
      mockAccount.balance.original.currency.id,
      2,
      getState
    )

    expect(result).toEqual(mockAccount.balance.original.currency)
  })

  it('falls back to placeholder when catalog is unavailable', () => {
    const getState = () =>
      ({
        settings: { settings: null },
        account: { accounts: [] },
      }) as never

    const result = resolveMoneyViewCurrencyForTempAccount(
      'unknown-id',
      4,
      getState
    )

    expect(result).toEqual({
      id: 'unknown-id',
      code: '--',
      symbol: '',
      decimal_digits: 4,
    })
  })
})

describe('resolveMoneyViewCurrencyForAccountUpdate', () => {
  const getEmptyState = () =>
    ({
      settings: { settings: null },
      account: { accounts: [] },
    }) as never

  beforeEach(() => {
    vi.clearAllMocks()
    queryClient.clear()
  })

  it('resolves currency from the React Query catalog cache', async () => {
    const eur = createMockCurrency({
      id: 'currency-eur',
      code: 'EUR',
      symbol: '€',
      name: 'Euro',
    })
    queryClient.setQueryData(['currencies'], [eur])

    const result = await resolveMoneyViewCurrencyForAccountUpdate(
      eur.id,
      2,
      getEmptyState
    )

    expect(result).toEqual({
      id: eur.id,
      code: 'EUR',
      symbol: '€',
      decimal_digits: eur.decimal_digits,
    })
    expect(currencyControllerFindOne).not.toHaveBeenCalled()
  })

  it('fetches currency from the API when not in cache or local state', async () => {
    const jpy = createMockCurrency({
      id: 'currency-jpy',
      code: 'JPY',
      symbol: '¥',
      name: 'Yen',
      decimal_digits: 0,
    })
    vi.mocked(currencyControllerFindOne).mockResolvedValue(jpy)

    const result = await resolveMoneyViewCurrencyForAccountUpdate(
      jpy.id,
      2,
      getEmptyState
    )

    expect(currencyControllerFindOne).toHaveBeenCalledWith(jpy.id)
    expect(result).toEqual({
      id: jpy.id,
      code: 'JPY',
      symbol: '¥',
      decimal_digits: 0,
    })
  })
})
