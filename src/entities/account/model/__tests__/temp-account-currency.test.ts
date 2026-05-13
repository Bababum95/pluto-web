import { describe, it, expect } from 'vitest'

import { mockCurrency } from '@/testing/data/currency'
import { mockAccount } from '@/testing/data/account'

import { resolveMoneyViewCurrencyForTempAccount } from '../temp-account-currency'

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
