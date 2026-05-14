import { describe, it, expect, beforeEach, vi } from 'vitest'

import { transactionRepository } from '../repository'
import { db } from '@/shared/lib/local-storage/db'
import { createMockTransaction } from '@/testing/data/transaction'
import type { TransactionDto } from '@/shared/api/generated/model'

vi.mock('@/shared/lib/local-storage/config', () => ({
  LOCAL_DATA_MODE: 'dexie',
}))

describe('transactionRepository', () => {
  beforeEach(async () => {
    await db.transactions.clear()
  })

  describe('save / getById', () => {
    it('round-trips a single transaction', async () => {
      const tx = createMockTransaction({ id: 'tx-1' })
      await transactionRepository.save(tx)

      const got = await transactionRepository.getById('tx-1')
      expect(got).toEqual(tx)
    })

    it('returns null when transaction is missing', async () => {
      const got = await transactionRepository.getById('does-not-exist')
      expect(got).toBeNull()
    })

    it('marks temp ids as dirty and leaves syncedAt undefined', async () => {
      await transactionRepository.save(
        createMockTransaction({ id: 'temp-abc' })
      )
      const row = await db.transactions.get('temp-abc')
      expect(row?.isDirty).toBe(true)
      expect(row?.syncedAt).toBeUndefined()
    })

    it('marks server ids as clean and stamps syncedAt', async () => {
      await transactionRepository.save(createMockTransaction({ id: 'tx-1' }))
      const row = await db.transactions.get('tx-1')
      expect(row?.isDirty).toBe(false)
      expect(row?.syncedAt).toBeTruthy()
    })
  })

  describe('saveMany', () => {
    it('bulk-inserts and preserves temp/server isDirty flags', async () => {
      await transactionRepository.saveMany([
        createMockTransaction({ id: 'tx-1' }),
        createMockTransaction({ id: 'temp-2' }),
      ])

      const rows = await db.transactions.toArray()
      const byId = Object.fromEntries(rows.map((r) => [r.id, r]))
      expect(byId['tx-1'].isDirty).toBe(false)
      expect(byId['tx-1'].syncedAt).toBeTruthy()
      expect(byId['temp-2'].isDirty).toBe(true)
      expect(byId['temp-2'].syncedAt).toBeUndefined()
    })
  })

  describe('getAll', () => {
    it('returns all transactions sorted by date desc', async () => {
      await transactionRepository.saveMany([
        createMockTransaction({ id: 'old', date: '2024-01-01' }),
        createMockTransaction({ id: 'new', date: '2024-06-01' }),
        createMockTransaction({ id: 'mid', date: '2024-03-01' }),
      ])

      const list = await transactionRepository.getAll()
      expect(list.map((t) => t.id)).toEqual(['new', 'mid', 'old'])
    })

    it('returns empty array when table is empty', async () => {
      const list = await transactionRepository.getAll()
      expect(list).toEqual([])
    })
  })

  describe('getByAccount', () => {
    it('returns transactions for the given account sorted by date desc', async () => {
      const accountA = { ...createMockTransaction().account, id: 'acc-a' }
      const accountB = { ...createMockTransaction().account, id: 'acc-b' }

      await transactionRepository.saveMany([
        createMockTransaction({
          id: 'a1',
          account: accountA,
          date: '2024-02-01',
        }),
        createMockTransaction({
          id: 'a2',
          account: accountA,
          date: '2024-03-01',
        }),
        createMockTransaction({
          id: 'b1',
          account: accountB,
          date: '2024-02-15',
        }),
      ])

      const list = await transactionRepository.getByAccount('acc-a')
      expect(list.map((t) => t.id)).toEqual(['a2', 'a1'])
    })
  })

  describe('getByDateRange', () => {
    it('returns transactions inside the inclusive date range', async () => {
      await transactionRepository.saveMany([
        createMockTransaction({ id: 'before', date: '2024-01-31' }),
        createMockTransaction({ id: 'lower', date: '2024-02-01' }),
        createMockTransaction({ id: 'mid', date: '2024-02-15' }),
        createMockTransaction({ id: 'upper', date: '2024-02-28' }),
        createMockTransaction({ id: 'after', date: '2024-03-01' }),
      ])

      const list = await transactionRepository.getByDateRange(
        '2024-02-01',
        '2024-02-28'
      )
      expect(list.map((t) => t.id)).toEqual(['upper', 'mid', 'lower'])
    })
  })

  describe('getByDateRangeAndType', () => {
    it('filters by date range and type tab', async () => {
      await transactionRepository.saveMany([
        createMockTransaction({
          id: 'exp-early',
          date: '2024-02-05',
          type: 'expense',
        }),
        createMockTransaction({
          id: 'inc-mid',
          date: '2024-02-15',
          type: 'income',
        }),
        createMockTransaction({
          id: 'exp-late',
          date: '2024-02-25',
          type: 'expense',
        }),
      ])

      const expense = await transactionRepository.getByDateRangeAndType(
        '2024-02-01',
        '2024-02-28',
        'expense'
      )
      expect(expense.map((t) => t.id)).toEqual(['exp-late', 'exp-early'])

      const income = await transactionRepository.getByDateRangeAndType(
        '2024-02-01',
        '2024-02-28',
        'income'
      )
      expect(income.map((t) => t.id)).toEqual(['inc-mid'])
    })
  })

  describe('update', () => {
    it('partial-updates an existing transaction and marks it dirty', async () => {
      await transactionRepository.save(createMockTransaction({ id: 'tx-1' }))

      await transactionRepository.update('tx-1', { comment: 'edited' })

      const row = await db.transactions.get('tx-1')
      expect(row?.payload.comment).toBe('edited')
      expect(row?.isDirty).toBe(true)
    })

    it('refreshes denormalized indexes (accountId, date, type)', async () => {
      await transactionRepository.save(createMockTransaction({ id: 'tx-1' }))

      const newAccount = {
        ...createMockTransaction().account,
        id: 'new-acc',
      }
      await transactionRepository.update('tx-1', {
        account: newAccount,
        date: '2024-09-09',
        type: 'income',
      })

      const row = await db.transactions.get('tx-1')
      expect(row?.accountId).toBe('new-acc')
      expect(row?.date).toBe('2024-09-09')
      expect(row?.type).toBe('income')
    })

    it('is a no-op when the row does not exist', async () => {
      await transactionRepository.update('missing', { comment: 'x' })
      const row = await db.transactions.get('missing')
      expect(row).toBeUndefined()
    })
  })

  describe('delete', () => {
    it('removes a transaction by id', async () => {
      await transactionRepository.save(createMockTransaction({ id: 'tx-1' }))
      await transactionRepository.delete('tx-1')
      expect(await db.transactions.get('tx-1')).toBeUndefined()
    })
  })

  describe('syncFromApi', () => {
    it('upserts non-dirty rows with isDirty=false and stamped syncedAt', async () => {
      await transactionRepository.syncFromApi([
        createMockTransaction({
          id: 'srv-1',
          updatedAt: '2024-06-01T00:00:00.000Z',
        }),
      ])

      const row = await db.transactions.get('srv-1')
      expect(row?.isDirty).toBe(false)
      expect(row?.syncedAt).toBeTruthy()
      expect(row?.updatedAt).toBe('2024-06-01T00:00:00.000Z')
    })

    it('skips rows marked dirty locally', async () => {
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

    it('skips entries without id or account', async () => {
      const errorSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      await transactionRepository.syncFromApi([
        // valid
        createMockTransaction({ id: 'srv-good' }),
        // missing id
        {
          ...createMockTransaction({ id: 'srv-good' }),
          id: '',
        } as TransactionDto,
        // missing account
        {
          ...createMockTransaction({ id: 'no-account' }),
          account: undefined as never,
        } as TransactionDto,
      ])

      const rows = await db.transactions.toArray()
      expect(rows.map((r) => r.id)).toEqual(['srv-good'])
      expect(errorSpy).toHaveBeenCalledTimes(2)
      errorSpy.mockRestore()
    })

    it('logs and bails on non-array input', async () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await transactionRepository.syncFromApi(
        null as unknown as TransactionDto[]
      )

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('invalid transactions data')
      )
      expect(await db.transactions.toArray()).toEqual([])
      errorSpy.mockRestore()
    })
  })

  describe('clear', () => {
    it('drops every row in the transactions table', async () => {
      await transactionRepository.saveMany([
        createMockTransaction({ id: 'tx-1' }),
        createMockTransaction({ id: 'tx-2' }),
      ])

      await transactionRepository.clear()
      expect(await db.transactions.toArray()).toEqual([])
    })
  })
})
