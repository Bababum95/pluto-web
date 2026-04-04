import { describe, it, expect } from 'vitest'

import type { RootState } from '@/store'
import {
  selectTransferById,
  selectTransfersByDay,
} from './selectors'
import { createMockTransfer } from '@/testing/data/transfer'

function transferState(
  transfers: RootState['transfer']['transfers']
): RootState['transfer'] {
  return {
    transfers,
    status: 'success',
  }
}

function state(transfer: RootState['transfer']): RootState {
  return { transfer } as RootState
}

describe('transfer selectors', () => {
  describe('selectTransferById', () => {
    it('returns transfer when id matches', () => {
      const t1 = createMockTransfer({ id: 'a' })
      const t2 = createMockTransfer({ id: 'b' })
      const s = state(transferState([t1, t2]))
      expect(selectTransferById('b')(s)).toEqual(t2)
    })

    it('returns undefined when id not found', () => {
      const s = state(transferState([createMockTransfer({ id: 'a' })]))
      expect(selectTransferById('missing')(s)).toBeUndefined()
    })
  })

  describe('selectTransfersByDay', () => {
    it('returns empty array when transfers list is empty', () => {
      const s = state(transferState([]))
      expect(selectTransfersByDay(s)).toEqual([])
    })

    it('groups transfers on the same calendar day (UTC)', () => {
      const t1 = createMockTransfer({
        id: 't1',
        createdAt: '2024-06-10T08:00:00.000Z',
      })
      const t2 = createMockTransfer({
        id: 't2',
        createdAt: '2024-06-10T22:00:00.000Z',
      })
      const s = state(transferState([t1, t2]))
      expect(selectTransfersByDay(s)).toEqual([
        { date: '2024-06-10', list: [t1, t2] },
      ])
    })

    it('creates separate groups for different days in order', () => {
      const t1 = createMockTransfer({
        id: 't1',
        createdAt: '2024-06-09T12:00:00.000Z',
      })
      const t2 = createMockTransfer({
        id: 't2',
        createdAt: '2024-06-10T12:00:00.000Z',
      })
      const t3 = createMockTransfer({
        id: 't3',
        createdAt: '2024-06-11T12:00:00.000Z',
      })
      const s = state(transferState([t1, t2, t3]))
      expect(selectTransfersByDay(s)).toEqual([
        { date: '2024-06-09', list: [t1] },
        { date: '2024-06-10', list: [t2] },
        { date: '2024-06-11', list: [t3] },
      ])
    })

    it('starts a new group when same day appears again after another day', () => {
      const morning = createMockTransfer({
        id: 'a',
        createdAt: '2024-01-01T10:00:00.000Z',
      })
      const nextDay = createMockTransfer({
        id: 'b',
        createdAt: '2024-01-02T10:00:00.000Z',
      })
      const lateFirstDay = createMockTransfer({
        id: 'c',
        createdAt: '2024-01-01T20:00:00.000Z',
      })
      const s = state(transferState([morning, nextDay, lateFirstDay]))
      expect(selectTransfersByDay(s)).toEqual([
        { date: '2024-01-01', list: [morning] },
        { date: '2024-01-02', list: [nextDay] },
        { date: '2024-01-01', list: [lateFirstDay] },
      ])
    })
  })
})
