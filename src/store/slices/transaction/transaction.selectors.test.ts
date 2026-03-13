import { describe, it, expect, vi } from 'vitest'

vi.mock('@/store', () => ({
  createStore: vi.fn(() => ({ getState: vi.fn(() => ({})) })),
}))

import type { RootState } from '@/store'
import {
  selectTransactionsByCategory,
  selectTransactionsByDay,
} from '@/store/slices/transaction/selectors'
import { createMockTransaction } from '@/testing/data/transaction'
import { mockCategory, createMockCategory } from '@/testing/data/category'
import { mockCurrency } from '@/testing/data/currency'

const currencyRef = {
  id: mockCurrency.id,
  code: 'USD',
  symbol: '$',
  decimal_digits: 2,
}

function makeTransactionState(
  transactions: RootState['transaction']['transactions']
): RootState['transaction'] {
  return {
    transactions,
    summary: null,
    status: 'idle',
  }
}

function state(transaction: RootState['transaction']): RootState {
  return { transaction } as RootState
}

describe('transaction selectors', () => {
  describe('selectTransactionsByCategory', () => {
    it('returns empty array when transactions list is empty', () => {
      const s = state(makeTransactionState([]))
      expect(selectTransactionsByCategory(s)).toEqual([])
    })

    it('returns one group when all transactions share one category (object)', () => {
      const tx1 = createMockTransaction({
        id: 'tx-1',
        category: mockCategory,
        amount: {
          original: { raw: -1000, scale: 2, value: -10, currency: currencyRef },
          converted: {
            raw: -1000,
            scale: 2,
            value: -10,
            currency: currencyRef,
          },
        },
      })
      const tx2 = createMockTransaction({
        id: 'tx-2',
        category: mockCategory,
        amount: {
          original: { raw: -500, scale: 2, value: -5, currency: currencyRef },
          converted: { raw: -500, scale: 2, value: -5, currency: currencyRef },
        },
      })
      const s = state(makeTransactionState([tx1, tx2]))
      const result = selectTransactionsByCategory(s)
      expect(result).toHaveLength(1)
      expect(result[0].category).toEqual(mockCategory)
      expect(result[0].list).toHaveLength(2)
      expect(result[0].total).toBe(-1500)
      expect(result[0].scale).toBe(2)
    })

    it('groups by category when category is object with id', () => {
      const cat2 = createMockCategory({ id: 'category-2', name: 'Transport' })
      const tx1 = createMockTransaction({
        id: 'tx-1',
        category: mockCategory,
        amount: {
          original: { raw: -1000, scale: 2, value: -10, currency: currencyRef },
          converted: {
            raw: -1000,
            scale: 2,
            value: -10,
            currency: currencyRef,
          },
        },
      })
      const tx2 = createMockTransaction({
        id: 'tx-2',
        category: cat2,
        amount: {
          original: { raw: -2000, scale: 2, value: -20, currency: currencyRef },
          converted: {
            raw: -2000,
            scale: 2,
            value: -20,
            currency: currencyRef,
          },
        },
      })
      const s = state(makeTransactionState([tx1, tx2]))
      const result = selectTransactionsByCategory(s)
      expect(result).toHaveLength(2)
      const byId = Object.fromEntries(
        result.map((g) => [
          typeof g.category === 'string' ? g.category : g.category.id,
          g,
        ])
      )
      expect(byId['category-1'].total).toBe(-1000)
      expect(byId['category-1'].list).toHaveLength(1)
      expect(byId['category-2'].total).toBe(-2000)
      expect(byId['category-2'].list).toHaveLength(1)
    })

    it('groups by category when category is string id', () => {
      const txWithStringCategory = createMockTransaction({
        id: 'tx-str',
        category: 'category-string' as unknown as typeof mockCategory,
        amount: {
          original: { raw: -3000, scale: 2, value: -30, currency: currencyRef },
          converted: {
            raw: -3000,
            scale: 2,
            value: -30,
            currency: currencyRef,
          },
        },
      })
      const s = state(makeTransactionState([txWithStringCategory]))
      const result = selectTransactionsByCategory(s)
      expect(result).toHaveLength(1)
      expect(result[0].category).toBe('category-string')
      expect(result[0].total).toBe(-3000)
      expect(result[0].list).toHaveLength(1)
      expect(result[0].list[0]).not.toHaveProperty('category')
    })

    it('sums raw amounts per category and omits category from list items', () => {
      const tx1 = createMockTransaction({
        id: 'a',
        category: mockCategory,
        amount: {
          original: { raw: 100, scale: 2, value: 1, currency: currencyRef },
          converted: { raw: 100, scale: 2, value: 1, currency: currencyRef },
        },
      })
      const tx2 = createMockTransaction({
        id: 'b',
        category: mockCategory,
        amount: {
          original: { raw: 200, scale: 2, value: 2, currency: currencyRef },
          converted: { raw: 200, scale: 2, value: 2, currency: currencyRef },
        },
      })
      const s = state(makeTransactionState([tx1, tx2]))
      const result = selectTransactionsByCategory(s)
      expect(result[0].total).toBe(300)
      result[0].list.forEach((item) => {
        expect(item).not.toHaveProperty('category')
        expect(item).toHaveProperty('amount')
      })
    })
  })

  describe('selectTransactionsByDay', () => {
    it('returns empty array when transactions list is empty', () => {
      const s = state(makeTransactionState([]))
      expect(selectTransactionsByDay(s)).toEqual([])
    })

    it('returns one group for a single transaction', () => {
      const tx = createMockTransaction({
        id: 'tx-1',
        date: '2024-03-15',
        amount: {
          original: { raw: -1000, scale: 2, value: -10, currency: currencyRef },
          converted: {
            raw: -1000,
            scale: 2,
            value: -10,
            currency: currencyRef,
          },
        },
      })
      const s = state(makeTransactionState([tx]))
      const result = selectTransactionsByDay(s)
      expect(result).toHaveLength(1)
      expect(result[0].date).toBe('2024-03-15')
      expect(result[0].list).toHaveLength(1)
      expect(result[0].list[0].id).toBe('tx-1')
      expect(result[0].total.raw).toBe(-1000)
      expect(result[0].total.scale).toBe(2)
      expect(result[0].total.currency).toEqual(currencyRef)
    })

    it('groups by date (YYYY-MM-DD) when multiple transactions on same day', () => {
      const tx1 = createMockTransaction({
        id: 'tx-1',
        date: '2024-03-15',
        amount: {
          original: { raw: -1000, scale: 2, value: -10, currency: currencyRef },
          converted: {
            raw: -1000,
            scale: 2,
            value: -10,
            currency: currencyRef,
          },
        },
      })
      const tx2 = createMockTransaction({
        id: 'tx-2',
        date: '2024-03-15',
        amount: {
          original: { raw: -500, scale: 2, value: -5, currency: currencyRef },
          converted: { raw: -500, scale: 2, value: -5, currency: currencyRef },
        },
      })
      const s = state(makeTransactionState([tx1, tx2]))
      const result = selectTransactionsByDay(s)
      expect(result).toHaveLength(1)
      expect(result[0].date).toBe('2024-03-15')
      expect(result[0].list).toHaveLength(2)
      expect(result[0].total.raw).toBe(-1500)
    })

    it('creates separate groups for different days (order preserved)', () => {
      const tx1 = createMockTransaction({
        id: 'tx-1',
        date: '2024-03-15',
        amount: {
          original: { raw: -1000, scale: 2, value: -10, currency: currencyRef },
          converted: {
            raw: -1000,
            scale: 2,
            value: -10,
            currency: currencyRef,
          },
        },
      })
      const tx2 = createMockTransaction({
        id: 'tx-2',
        date: '2024-03-16',
        amount: {
          original: { raw: -2000, scale: 2, value: -20, currency: currencyRef },
          converted: {
            raw: -2000,
            scale: 2,
            value: -20,
            currency: currencyRef,
          },
        },
      })
      const tx3 = createMockTransaction({
        id: 'tx-3',
        date: '2024-03-15',
        amount: {
          original: { raw: -500, scale: 2, value: -5, currency: currencyRef },
          converted: { raw: -500, scale: 2, value: -5, currency: currencyRef },
        },
      })
      const s = state(makeTransactionState([tx1, tx2, tx3]))
      const result = selectTransactionsByDay(s)
      expect(result).toHaveLength(3)
      expect(result[0].date).toBe('2024-03-15')
      expect(result[0].list).toHaveLength(1)
      expect(result[0].total.raw).toBe(-1000)
      expect(result[1].date).toBe('2024-03-16')
      expect(result[1].list).toHaveLength(1)
      expect(result[1].total.raw).toBe(-2000)
      expect(result[2].date).toBe('2024-03-15')
      expect(result[2].list).toHaveLength(1)
      expect(result[2].total.raw).toBe(-500)
    })

    it('normalizes date to ISO date string (YYYY-MM-DD)', () => {
      const tx = createMockTransaction({
        id: 'tx-1',
        date: '2024-01-01T23:00:00.000Z',
        amount: {
          original: { raw: 0, scale: 2, value: 0, currency: currencyRef },
          converted: { raw: 0, scale: 2, value: 0, currency: currencyRef },
        },
      })
      const s = state(makeTransactionState([tx]))
      const result = selectTransactionsByDay(s)
      expect(result[0].date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })
  })
})
