import { describe, it, expect, beforeEach, vi } from 'vitest'

import { transactionRepository } from '../repository'
import { db } from '@/lib/local/db'
import { createMockTransaction } from '@/testing/data/transaction'

vi.mock('@/lib/local/config', () => ({
  LOCAL_DATA_MODE: 'dexie',
}))

describe('transactionRepository', () => {
  beforeEach(async () => {
    await db.transactions.clear()
  })

  it('save and getById round-trip', async () => {
    const tx = createMockTransaction({ id: 'tx-1' })
    await transactionRepository.save(tx)

    const got = await transactionRepository.getById('tx-1')
    expect(got).toEqual(tx)
  })

  it('getByDateRangeAndType filters by date and type', async () => {
    const a = createMockTransaction({
      id: 'a',
      date: '2024-02-01',
      type: 'expense',
    })
    const b = createMockTransaction({
      id: 'b',
      date: '2024-02-10',
      type: 'income',
    })
    await transactionRepository.saveMany([a, b])

    const expenseOnly = await transactionRepository.getByDateRangeAndType(
      '2024-02-01',
      '2024-02-28',
      'expense'
    )
    expect(expenseOnly.map((t) => t.id)).toEqual(['a'])
  })

  it('syncFromApi skips dirty rows', async () => {
    const base = createMockTransaction({ id: 'dirty-1', comment: 'original' })
    await transactionRepository.save(base)
    await transactionRepository.update('dirty-1', { comment: 'local edit' })

    await transactionRepository.syncFromApi([
      createMockTransaction({
        id: 'dirty-1',
        comment: 'server',
        updatedAt: '2024-06-01T00:00:00.000Z',
      }),
    ])

    const merged = await transactionRepository.getById('dirty-1')
    expect(merged?.comment).toBe('local edit')
  })
})
