import { describe, it, expect, vi } from 'vitest'

vi.mock('@/store', () => ({
  createStore: vi.fn(() => ({ getState: vi.fn(() => ({})) })),
}))

import transferReducer, {
  setTransfers,
  addTransfer,
  removeTransfer,
  clearTransfers,
  fetchTransfers,
  createTransfer,
  deleteTransfer,
} from './index'
import { createMockTransfer } from '@/testing/data/transfer'

const t1 = createMockTransfer({ id: 'transfer-1' })
const t2 = createMockTransfer({ id: 'transfer-2' })

describe('transfer slice', () => {
  describe('reducers', () => {
    it('setTransfers replaces list', () => {
      const state = transferReducer(undefined, setTransfers([t1]))
      expect(state.transfers).toHaveLength(1)
      expect(state.transfers[0].id).toBe('transfer-1')
    })

    it('addTransfer appends transfer', () => {
      let state = transferReducer(undefined, setTransfers([t1]))
      state = transferReducer(state, addTransfer(t2))
      expect(state.transfers).toHaveLength(2)
      expect(state.transfers[1].id).toBe('transfer-2')
    })

    it('removeTransfer removes by id', () => {
      let state = transferReducer(undefined, setTransfers([t1, t2]))
      state = transferReducer(state, removeTransfer('transfer-1'))
      expect(state.transfers).toHaveLength(1)
      expect(state.transfers[0].id).toBe('transfer-2')
    })

    it('clearTransfers empties list', () => {
      let state = transferReducer(undefined, setTransfers([t1]))
      state = transferReducer(state, clearTransfers())
      expect(state.transfers).toHaveLength(0)
    })
  })

  describe('fetchTransfers', () => {
    it('pending sets status to pending', () => {
      const state = transferReducer(
        undefined,
        fetchTransfers.pending('req-1', undefined)
      )
      expect(state.status).toBe('pending')
    })

    it('fulfilled sets transfers and status success', () => {
      const list = [t1, t2]
      const action = fetchTransfers.fulfilled(list, 'req-1', undefined)
      const state = transferReducer(undefined, action)
      expect(state.status).toBe('success')
      expect(state.transfers).toEqual(list)
    })

    it('rejected sets status to failed', () => {
      const state = transferReducer(
        undefined,
        fetchTransfers.rejected(new Error('fail'), 'req-1', undefined)
      )
      expect(state.status).toBe('failed')
    })
  })

  describe('createTransfer', () => {
    const dto = {
      from: { account: 'a', value: 1, scale: 2 },
      to: { account: 'b', value: 1, scale: 2 },
      rate: 1,
    } as const

    it('pending sets status to pending', () => {
      const state = transferReducer(
        undefined,
        createTransfer.pending('req-1', dto)
      )
      expect(state.status).toBe('pending')
    })

    it('fulfilled appends transfer', () => {
      const newTransfer = createMockTransfer({ id: 'transfer-new' })
      const action = createTransfer.fulfilled(newTransfer, 'req-1', dto)
      let state = transferReducer(undefined, setTransfers([t1]))
      state = transferReducer(state, action)
      expect(state.status).toBe('success')
      expect(state.transfers).toHaveLength(2)
      expect(state.transfers[1]).toEqual(newTransfer)
    })

    it('rejected sets status to failed', () => {
      const state = transferReducer(
        undefined,
        createTransfer.rejected(new Error('fail'), 'req-1', dto)
      )
      expect(state.status).toBe('failed')
    })
  })

  describe('deleteTransfer', () => {
    it('fulfilled removes transfer by meta.arg id', () => {
      let state = transferReducer(undefined, setTransfers([t1, t2]))
      const action = deleteTransfer.fulfilled(undefined, 'req-1', 'transfer-1')
      state = transferReducer(state, action)
      expect(state.transfers).toHaveLength(1)
      expect(state.transfers[0].id).toBe('transfer-2')
    })
  })
})
