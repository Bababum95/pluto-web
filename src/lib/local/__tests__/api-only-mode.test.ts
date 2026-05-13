import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/local/config', () => ({
  LOCAL_DATA_MODE: 'api-only' as const,
  getLocalDataMode: (): 'dexie' | 'api-only' => 'api-only',
}))

import { db } from '@/lib/local/db'
import { userRepository } from '@/entities/user/local/repository'
import { settingsRepository } from '@/entities/settings/local/repository'
import { tagRepository } from '@/entities/tag/local/repository'
import { categoryRepository } from '@/entities/category/local/repository'
import { accountRepository } from '@/entities/account/local/repository'
import { exchangeRateRepository } from '@/entities/exchange-rate/local/repository'
import { transactionRepository } from '@/entities/transaction/local/repository'
import { transferRepository } from '@/entities/transfer/local/repository'

import { mockUser } from '@/testing/data/user'
import { mockTransaction } from '@/testing/data/transaction'
import { mockTransfer } from '@/testing/data/transfer'

/**
 * In api-only mode, every repository method must short-circuit before
 * touching IndexedDB. This suite primes Dexie with rows manually and
 * proves that no repository read/write observes or mutates those rows.
 */
describe('repositories in api-only mode', () => {
  beforeEach(async () => {
    await Promise.all([
      db.users.clear(),
      db.settings.clear(),
      db.tags.clear(),
      db.categories.clear(),
      db.accounts.clear(),
      db.exchangeRates.clear(),
      db.transactions.clear(),
      db.transfers.clear(),
    ])
  })

  describe('reads return empty defaults', () => {
    it('userRepository.getById returns null', async () => {
      await db.users.put({
        id: 'u-1',
        payload: mockUser,
        updatedAt: '2024-01-01T00:00:00.000Z',
      })
      expect(await userRepository.getById('u-1')).toBeNull()
      expect(await userRepository.getAll()).toEqual([])
    })

    it('settingsRepository.get returns null', async () => {
      expect(await settingsRepository.get()).toBeNull()
    })

    it('tagRepository.getById/getAll return empty defaults', async () => {
      expect(await tagRepository.getById('t-1')).toBeNull()
      expect(await tagRepository.getAll()).toEqual([])
    })

    it('categoryRepository.getById/getAll return empty defaults', async () => {
      expect(await categoryRepository.getById('c-1')).toBeNull()
      expect(await categoryRepository.getAll()).toEqual([])
    })

    it('accountRepository.getById/getAll return empty defaults', async () => {
      expect(await accountRepository.getById('a-1')).toBeNull()
      expect(await accountRepository.getAll()).toEqual([])
    })

    it('exchangeRateRepository.getAll returns empty array', async () => {
      expect(await exchangeRateRepository.getAll()).toEqual([])
    })

    it('transactionRepository read methods return empty defaults', async () => {
      expect(await transactionRepository.getById('tx-1')).toBeNull()
      expect(await transactionRepository.getAll()).toEqual([])
      expect(await transactionRepository.getByAccount('a-1')).toEqual([])
      expect(
        await transactionRepository.getByDateRange('2024-01-01', '2024-12-31')
      ).toEqual([])
      expect(
        await transactionRepository.getByDateRangeAndType(
          '2024-01-01',
          '2024-12-31',
          'expense'
        )
      ).toEqual([])
    })

    it('transferRepository read methods return empty defaults', async () => {
      expect(await transferRepository.getById('tr-1')).toBeNull()
      expect(await transferRepository.getAll()).toEqual([])
      expect(await transferRepository.getByAccount('a-1')).toEqual([])
      expect(await transferRepository.getByCreatedRange()).toEqual([])
    })
  })

  describe('writes are no-ops', () => {
    it('userRepository writes never touch Dexie', async () => {
      await userRepository.save(mockUser)
      await userRepository.update('u-1', { email: 'x@y.z' } as Partial<
        typeof mockUser
      >)
      await userRepository.delete('u-1')
      await userRepository.syncFromApi(mockUser)
      await userRepository.syncToApi('u-1')
      await userRepository.clear()
      expect(await db.users.toArray()).toEqual([])
    })

    it('tagRepository writes never touch Dexie', async () => {
      await tagRepository.save({ id: 't-1', name: 'X' } as never)
      await tagRepository.saveMany([{ id: 't-1', name: 'X' } as never])
      await tagRepository.delete('t-1')
      await tagRepository.syncFromApi([{ id: 't-1', name: 'X' } as never])
      await tagRepository.clear()
      expect(await db.tags.toArray()).toEqual([])
    })

    it('categoryRepository writes never touch Dexie', async () => {
      const cat = { id: 'c-1', name: 'X', order: 0 } as never
      await categoryRepository.save(cat)
      await categoryRepository.saveMany([cat])
      await categoryRepository.update('c-1', { name: 'Y' } as never)
      await categoryRepository.delete('c-1')
      await categoryRepository.syncFromApi([cat])
      await categoryRepository.clear()
      expect(await db.categories.toArray()).toEqual([])
    })

    it('accountRepository writes never touch Dexie', async () => {
      const acc = { id: 'a-1', name: 'X', order: 0 } as never
      await accountRepository.save(acc)
      await accountRepository.saveMany([acc])
      await accountRepository.update('a-1', { name: 'Y' } as never)
      await accountRepository.delete('a-1')
      await accountRepository.syncFromApi([acc])
      await accountRepository.clear()
      expect(await db.accounts.toArray()).toEqual([])
    })

    it('settingsRepository writes never touch Dexie', async () => {
      await settingsRepository.save({ id: 'current' } as never)
      await settingsRepository.syncFromApi({ id: 'current' } as never)
      await settingsRepository.clear()
      expect(await db.settings.toArray()).toEqual([])
    })

    it('exchangeRateRepository writes never touch Dexie', async () => {
      await exchangeRateRepository.saveMany([{ id: 'r-1' } as never])
      await exchangeRateRepository.syncFromApi([{ id: 'r-1' } as never])
      await exchangeRateRepository.clear()
      expect(await db.exchangeRates.toArray()).toEqual([])
    })

    it('transactionRepository writes never touch Dexie', async () => {
      await transactionRepository.save(mockTransaction)
      await transactionRepository.saveMany([mockTransaction])
      await transactionRepository.update('tx-1', { comment: 'x' })
      await transactionRepository.delete('tx-1')
      await transactionRepository.syncFromApi([mockTransaction])
      await transactionRepository.clear()
      expect(await db.transactions.toArray()).toEqual([])
    })

    it('transferRepository writes never touch Dexie', async () => {
      await transferRepository.save(mockTransfer)
      await transferRepository.saveMany([mockTransfer])
      await transferRepository.update('tr-1', { rate: 1 })
      await transferRepository.delete('tr-1')
      await transferRepository.syncFromApi([mockTransfer])
      await transferRepository.clear()
      expect(await db.transfers.toArray()).toEqual([])
    })
  })
})
