import { describe, it, expect } from 'vitest'

import { createMockAccount } from '@/testing/data/account'
import { mockCurrency } from '@/testing/data/currency'
import type { RateDto } from '@/entities/exchange-rate'
import type { MoneyViewCurrencyDto } from '@/shared/lib/money/types'

import {
  applyTransactionDeltaToAccount,
  calculateAccountsSummary,
  getSignedTransactionAmountRaw,
} from '../transaction-balance'

const ts = '2024-01-01T00:00:00.000Z'

const usd: MoneyViewCurrencyDto = {
  id: 'currency-usd',
  code: 'USD',
  symbol: '$',
  decimal_digits: 2,
}

const rates: RateDto[] = [
  { id: 'rate-usd', code: 'USD', value: 1, createdAt: ts, updatedAt: ts },
]

describe('getSignedTransactionAmountRaw', () => {
  it('negates amount for expense', () => {
    expect(getSignedTransactionAmountRaw('expense', 100)).toBe(-100)
  })

  it('keeps amount positive for income', () => {
    expect(getSignedTransactionAmountRaw('income', 100)).toBe(100)
  })
})

describe('applyTransactionDeltaToAccount', () => {
  it('updates original and converted balance after an expense', () => {
    const account = createMockAccount({
      balance: {
        original: {
          value: 1000,
          raw: 100000,
          scale: 2,
          currency: usd,
        },
        converted: {
          value: 1000,
          raw: 100000,
          scale: 2,
          currency: usd,
        },
      },
    })

    const updated = applyTransactionDeltaToAccount(
      account,
      getSignedTransactionAmountRaw('expense', 5000),
      rates,
      usd
    )

    expect(updated.balance.original.raw).toBe(95000)
    expect(updated.balance.original.value).toBe(950)
    expect(updated.balance.converted.raw).toBe(95000)
    expect(updated.balance.converted.value).toBe(950)
  })
})

describe('calculateAccountsSummary', () => {
  it('sums non-excluded accounts in target currency', () => {
    const included = createMockAccount({
      id: 'acc-1',
      excluded: false,
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
    const excluded = createMockAccount({
      id: 'acc-2',
      excluded: true,
      balance: {
        original: {
          value: 500,
          raw: 50000,
          scale: 2,
          currency: usd,
        },
        converted: {
          value: 500,
          raw: 50000,
          scale: 2,
          currency: usd,
        },
      },
    })

    const summary = calculateAccountsSummary(
      [included, excluded],
      rates,
      usd,
      mockCurrency
    )

    expect(summary.total_raw).toBe(10000)
    expect(summary.total).toBe(100)
    expect(summary.currency).toEqual(mockCurrency)
  })
})
