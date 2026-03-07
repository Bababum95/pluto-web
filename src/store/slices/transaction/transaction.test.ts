import { describe, it, expect, vi } from 'vitest'

// Avoid circular load: async-thunks import store → store loads account → account needs createTransaction.
// Mock store so it is not built when this test file loads.
vi.mock('@/store', () => ({
  createStore: vi.fn(() => ({ getState: vi.fn(() => ({})) })),
}))

import transactionReducer, {
  setTransactions,
  addTransaction,
  updateTransactionLocal,
  removeTransaction,
  clearTransactions,
  fetchTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from './index'
import { createMockTransaction } from '@/testing/data/transaction'
import { mockAccount, mockAccountSummary } from '@/testing/data/account'
import { mockCurrency } from '@/testing/data/currency'

const currencyRef = {
  id: mockCurrency.id,
  code: 'USD',
  symbol: '$',
  decimal_digits: 2,
}

const tx1 = createMockTransaction({
  id: 'tx-1',
  amount: {
    original: { raw: 1000, scale: 2, value: 10, currency: currencyRef },
    converted: { raw: 1000, scale: 2, value: 10, currency: currencyRef },
  },
})
const tx2 = createMockTransaction({
  id: 'tx-2',
  amount: {
    original: { raw: 2000, scale: 2, value: 20, currency: currencyRef },
    converted: { raw: 2000, scale: 2, value: 20, currency: currencyRef },
  },
})

describe('transaction slice', () => {
  describe('reducers', () => {
    it('setTransactions replaces list', () => {
      const state = transactionReducer(undefined, setTransactions([tx1]))
      expect(state.transactions).toHaveLength(1)
      expect(state.transactions[0].id).toBe('tx-1')
    })

    it('addTransaction appends transaction', () => {
      let state = transactionReducer(undefined, setTransactions([tx1]))
      state = transactionReducer(state, addTransaction(tx2))
      expect(state.transactions).toHaveLength(2)
      expect(state.transactions[1].id).toBe('tx-2')
    })

    it('updateTransactionLocal updates by id', () => {
      let state = transactionReducer(undefined, setTransactions([tx1, tx2]))
      const updated = createMockTransaction({ id: 'tx-1', comment: 'Updated' })
      state = transactionReducer(state, updateTransactionLocal(updated))
      expect(state.transactions[0].comment).toBe('Updated')
      expect(state.transactions[1].id).toBe('tx-2')
    })

    it('removeTransaction removes by id', () => {
      let state = transactionReducer(undefined, setTransactions([tx1, tx2]))
      state = transactionReducer(state, removeTransaction('tx-1'))
      expect(state.transactions).toHaveLength(1)
      expect(state.transactions[0].id).toBe('tx-2')
    })

    it('clearTransactions empties list', () => {
      let state = transactionReducer(undefined, setTransactions([tx1]))
      state = transactionReducer(state, clearTransactions())
      expect(state.transactions).toHaveLength(0)
    })
  })

  describe('fetchTransactions', () => {
    it('fulfilled sets transactions and computes summary total from converted.raw', () => {
      const list = [tx1, tx2]
      const action = fetchTransactions.fulfilled(list, 'req-1', undefined)
      const state = transactionReducer(undefined, action)
      expect(state.status).toBe('success')
      expect(state.transactions).toEqual(list)
      expect(state.summary).not.toBeNull()
      expect(state.summary!.total_raw).toBe(3000)
      expect(state.summary!.total).toBe(30)
      expect(state.summary!.scale).toBe(2)
      expect(state.summary!.currency).toEqual(currencyRef)
    })

    it('fulfilled with empty list sets summary from first item scale/currency or zero', () => {
      const action = fetchTransactions.fulfilled([], 'req-1', undefined)
      const state = transactionReducer(undefined, action)
      expect(state.transactions).toHaveLength(0)
      expect(state.summary).not.toBeNull()
      expect(state.summary!.total_raw).toBe(0)
      expect(state.summary!.total).toBe(0)
      expect(state.summary!.scale).toBe(0)
    })

    it('pending with clear: true clears transactions and resets summary total', () => {
      let state = transactionReducer(undefined, fetchTransactions.fulfilled([tx1, tx2], 'req-1', undefined))
      const pendingAction = fetchTransactions.pending('req-2', { clear: true })
      state = transactionReducer(state, pendingAction)
      expect(state.status).toBe('pending')
      expect(state.transactions).toHaveLength(0)
      expect(state.summary!.total_raw).toBe(0)
      expect(state.summary!.total).toBe(0)
    })

    it('rejected sets status to failed', () => {
      const action = fetchTransactions.rejected(new Error('fail'), 'req-1', undefined)
      const state = transactionReducer(undefined, action)
      expect(state.status).toBe('failed')
    })
  })

  describe('createTransaction', () => {
    it('fulfilled with insert: true adds transaction and recalculates summary', () => {
      let state = transactionReducer(undefined, fetchTransactions.fulfilled([tx1], 'req-1', undefined))
      const newTx = createMockTransaction({
        id: 'tx-new',
        amount: {
          original: { raw: 500, scale: 2, value: 5, currency: currencyRef },
          converted: { raw: 500, scale: 2, value: 5, currency: currencyRef },
        },
      })
      const action = createTransaction.fulfilled(
        { transaction: newTx, insert: true, account: mockAccount, summary: mockAccountSummary },
        'req-1',
        {} as never
      )
      state = transactionReducer(state, action)
      expect(state.transactions).toHaveLength(2)
      expect(state.transactions[0].id).toBe('tx-new')
      expect(state.summary!.total_raw).toBe(1500)
      expect(state.summary!.total).toBe(15)
    })

    it('fulfilled with insert: false does not add transaction', () => {
      let state = transactionReducer(undefined, fetchTransactions.fulfilled([tx1], 'req-1', undefined))
      const newTx = createMockTransaction({ id: 'tx-new' })
      const action = createTransaction.fulfilled(
        { transaction: newTx, insert: false, account: mockAccount, summary: mockAccountSummary },
        'req-1',
        {} as never
      )
      state = transactionReducer(state, action)
      expect(state.transactions).toHaveLength(1)
      expect(state.transactions[0].id).toBe('tx-1')
    })

    it('pending sets status to pending', () => {
      const action = createTransaction.pending('req-1', {} as never)
      const state = transactionReducer(undefined, action)
      expect(state.status).toBe('pending')
    })

    it('rejected sets status to failed', () => {
      const action = createTransaction.rejected(new Error('fail'), 'req-1', {} as never)
      const state = transactionReducer(undefined, action)
      expect(state.status).toBe('failed')
    })
  })

  describe('updateTransaction', () => {
    it('fulfilled updates transaction in list by id', () => {
      let state = transactionReducer(undefined, fetchTransactions.fulfilled([tx1, tx2], 'req-1', undefined))
      const updated = createMockTransaction({ id: 'tx-1', comment: 'Updated' })
      const action = updateTransaction.fulfilled(
        { ...updated, insert: true },
        'req-1',
        { id: 'tx-1', data: {} as never }
      )
      state = transactionReducer(state, action)
      expect(state.transactions[0].comment).toBe('Updated')
    })
  })

  describe('deleteTransaction', () => {
    it('fulfilled removes transaction by meta.arg id', () => {
      let state = transactionReducer(undefined, fetchTransactions.fulfilled([tx1, tx2], 'req-1', undefined))
      const action = deleteTransaction.fulfilled(undefined, 'req-1', 'tx-1')
      state = transactionReducer(state, action)
      expect(state.transactions).toHaveLength(1)
      expect(state.transactions[0].id).toBe('tx-2')
    })
  })
})
