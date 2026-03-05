import type { Transaction } from '@/features/transaction/types'
import { mockCategory } from './category'
import { mockTag } from './tag'
import { mockCurrency } from './currency'

const moneyViewCurrency = {
  id: mockCurrency.id,
  code: mockCurrency.code,
  symbol: mockCurrency.symbol,
  decimal_digits: mockCurrency.decimal_digits,
}

const moneyView = {
  value: -50,
  raw: -5000,
  scale: 2,
  currency: moneyViewCurrency,
}

export const mockTransaction: Transaction = {
  id: 'transaction-1',
  type: 'expense',
  category: mockCategory,
  comment: 'Lunch',
  amount: {
    original: moneyView,
    converted: moneyView,
  },
  tags: [mockTag],
  date: '2024-01-15',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

export function createMockTransaction(
  overrides?: Partial<Transaction>
): Transaction {
  return { ...mockTransaction, ...overrides }
}
