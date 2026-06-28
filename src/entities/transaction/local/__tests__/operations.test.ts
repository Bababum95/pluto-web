import { describe, it, expect, vi, beforeEach } from 'vitest'

import { db } from '@/shared/lib/local-storage/db'
import { mockAccount } from '@/testing/data/account'
import { mockCategory } from '@/testing/data/category'
import { mockSettings } from '@/testing/data/settings'
import { mockTag } from '@/testing/data/tag'
import { createMockTransaction } from '@/testing/data/transaction'

vi.mock('@/shared/lib/local-storage/config', () => ({
  LOCAL_DATA_MODE: 'dexie',
}))

vi.mock('@/shared/lib/local-storage/temp-id', () => ({
  generateTempEntityId: () => 'temp-txn-1',
}))

vi.mock('@/entities/account/local/repository', () => ({
  accountRepository: {
    getById: vi.fn(),
    getAll: vi.fn(),
    save: vi.fn(),
  },
}))

vi.mock('@/entities/category/local/repository', () => ({
  categoryRepository: {
    getById: vi.fn(),
  },
}))

vi.mock('@/entities/tag/local/repository', () => ({
  tagRepository: {
    getById: vi.fn(),
  },
}))

vi.mock('../outbox-helpers', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../outbox-helpers')>()
  return {
    ...actual,
    enqueueCreateTransaction: vi.fn(),
    enqueueUpdateTransaction: vi.fn(),
    enqueueDeleteTransaction: vi.fn(),
  }
})

import { accountRepository } from '@/entities/account/local/repository'
import { categoryRepository } from '@/entities/category/local/repository'
import { tagRepository } from '@/entities/tag/local/repository'

import {
  enqueueCreateTransaction,
  enqueueDeleteTransaction,
  enqueueUpdateTransaction,
} from '../outbox-helpers'
import { transactionLocalApi } from '../operations'
import { transactionRepository } from '../repository'

describe('transactionLocalApi', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    await db.transactions.clear()

    vi.mocked(accountRepository.getById).mockResolvedValue(mockAccount)
    vi.mocked(accountRepository.getAll).mockResolvedValue([mockAccount])
    vi.mocked(accountRepository.save).mockResolvedValue()
    vi.mocked(categoryRepository.getById).mockResolvedValue(mockCategory)
    vi.mocked(tagRepository.getById).mockResolvedValue(mockTag)
    vi.mocked(enqueueCreateTransaction).mockResolvedValue()
    vi.mocked(enqueueUpdateTransaction).mockResolvedValue()
    vi.mocked(enqueueDeleteTransaction).mockResolvedValue()
  })

  describe('create', () => {
    it('persists transaction, enqueues outbox, and returns mutation response', async () => {
      const result = await transactionLocalApi.create({
        data: {
          account: mockAccount.id,
          category: mockCategory.id,
          amount: 50,
          scale: 0,
          date: '2024-01-15',
          type: 'expense',
          comment: 'Coffee',
          tags: [mockTag.id],
        },
        rates: [],
        settingsCurrency: mockSettings.currency,
        settings: mockSettings,
      })

      expect(result.transaction.id).toBe('temp-txn-1')
      expect(result.accounts).toHaveLength(1)
      expect(result.summary).toBeDefined()
      expect(enqueueCreateTransaction).toHaveBeenCalledWith(
        'temp-txn-1',
        expect.objectContaining({ amount: 50, type: 'expense' })
      )
      expect(accountRepository.save).toHaveBeenCalled()

      const saved = await transactionRepository.getById('temp-txn-1')
      expect(saved?.comment).toBe('Coffee')
    })

    it('throws when account is missing', async () => {
      vi.mocked(accountRepository.getById).mockResolvedValue(null)

      await expect(
        transactionLocalApi.create({
          data: {
            account: 'missing',
            category: mockCategory.id,
            amount: 50,
            scale: 0,
            type: 'expense',
          },
          rates: [],
          settingsCurrency: mockSettings.currency,
          settings: mockSettings,
        })
      ).rejects.toThrow('Account not found')
    })

    it('throws when category is missing', async () => {
      vi.mocked(categoryRepository.getById).mockResolvedValue(null)

      await expect(
        transactionLocalApi.create({
          data: {
            account: mockAccount.id,
            category: 'missing',
            amount: 50,
            scale: 0,
            type: 'expense',
          },
          rates: [],
          settingsCurrency: mockSettings.currency,
          settings: mockSettings,
        })
      ).rejects.toThrow('Category not found')
    })
  })

  describe('update', () => {
    it('updates transaction locally and enqueues outbox operation', async () => {
      const existing = createMockTransaction({ id: 'tx-1', comment: 'Old' })
      await transactionRepository.save(existing)

      const result = await transactionLocalApi.update({
        id: 'tx-1',
        data: {
          account: mockAccount.id,
          category: mockCategory.id,
          amount: 75,
          scale: 0,
          date: '2024-02-01',
          type: 'expense',
          comment: 'Updated',
          tags: [],
        },
      })

      expect(result.transaction.comment).toBe('Updated')
      expect(enqueueUpdateTransaction).toHaveBeenCalled()
    })
  })

  describe('delete', () => {
    it('removes transaction locally and enqueues outbox operation', async () => {
      await transactionRepository.save(createMockTransaction({ id: 'tx-del' }))

      await transactionLocalApi.delete('tx-del')

      expect(await transactionRepository.getById('tx-del')).toBeNull()
      expect(enqueueDeleteTransaction).toHaveBeenCalledWith('tx-del')
    })
  })
})
