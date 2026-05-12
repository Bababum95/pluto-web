import { describe, it, expect, beforeEach, vi } from 'vitest'
import { accountRepository } from '../repository'
import { db } from '@/lib/local/db'
import type { AccountDto } from '@/features/account/types'

vi.mock('@/lib/local/config', () => ({
  LOCAL_DATA_MODE: 'dexie',
}))

describe('accountRepository', () => {
  beforeEach(async () => {
    await db.accounts.clear()
  })

  const createMockAccount = (overrides?: Partial<AccountDto>): AccountDto => ({
    id: 'account-1',
    name: 'Test Account',
    color: '#FF0000',
    icon: 'wallet',
    description: 'Test description',
    balance: {
      original: {
        value: 10,
        raw: 1000,
        scale: 2,
        currency: { id: 'usd-id', code: 'USD', symbol: '$', decimal_digits: 2 },
      },
      converted: {
        value: 10,
        raw: 1000,
        scale: 2,
        currency: { id: 'usd-id', code: 'USD', symbol: '$', decimal_digits: 2 },
      },
    },
    order: 0,
    excluded: false,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  })

  describe('getById', () => {
    it('should return null when account does not exist', async () => {
      const result = await accountRepository.getById('non-existent')
      expect(result).toBeNull()
    })

    it('should return account when it exists', async () => {
      const mockAccount = createMockAccount()
      await accountRepository.save(mockAccount)

      const result = await accountRepository.getById('account-1')
      expect(result).toEqual(mockAccount)
    })
  })

  describe('getAll', () => {
    it('should return empty array when no accounts exist', async () => {
      const result = await accountRepository.getAll()
      expect(result).toEqual([])
    })

    it('should return all accounts sorted by order', async () => {
      const account1 = createMockAccount({ id: 'account-1', name: 'First', order: 2 })
      const account2 = createMockAccount({ id: 'account-2', name: 'Second', order: 0 })
      const account3 = createMockAccount({ id: 'account-3', name: 'Third', order: 1 })

      await accountRepository.saveMany([account1, account2, account3])

      const result = await accountRepository.getAll()
      expect(result).toHaveLength(3)
      expect(result[0].id).toBe('account-2') // order: 0
      expect(result[1].id).toBe('account-3') // order: 1
      expect(result[2].id).toBe('account-1') // order: 2
    })
  })

  describe('save', () => {
    it('should save account to database', async () => {
      const mockAccount = createMockAccount()
      await accountRepository.save(mockAccount)

      const row = await db.accounts.get('account-1')
      expect(row).toBeDefined()
      expect(row?.payload).toEqual(mockAccount)
      expect(row?.syncedAt).toBeDefined()
      expect(row?.isDirty).toBe(false)
    })

    it('should update existing account', async () => {
      const mockAccount1 = createMockAccount({ name: 'Original' })
      const mockAccount2 = createMockAccount({ name: 'Updated' })

      await accountRepository.save(mockAccount1)
      await accountRepository.save(mockAccount2)

      const result = await accountRepository.getById('account-1')
      expect(result?.name).toBe('Updated')

      const count = await db.accounts.count()
      expect(count).toBe(1)
    })
  })

  describe('saveMany', () => {
    it('should save multiple accounts', async () => {
      const accounts = [
        createMockAccount({ id: 'account-1', name: 'First' }),
        createMockAccount({ id: 'account-2', name: 'Second' }),
      ]

      await accountRepository.saveMany(accounts)

      const result = await accountRepository.getAll()
      expect(result).toHaveLength(2)
    })
  })

  describe('update', () => {
    it('should update account fields and mark as dirty', async () => {
      const mockAccount = createMockAccount()
      await accountRepository.save(mockAccount)

      await accountRepository.update('account-1', { name: 'Updated Name' })

      const row = await db.accounts.get('account-1')
      expect(row?.payload.name).toBe('Updated Name')
      expect(row?.isDirty).toBe(true)
    })

    it('should do nothing when account does not exist', async () => {
      await accountRepository.update('non-existent', { name: 'Updated' })

      const result = await accountRepository.getById('non-existent')
      expect(result).toBeNull()
    })
  })

  describe('delete', () => {
    it('should delete account from database', async () => {
      const mockAccount = createMockAccount()
      await accountRepository.save(mockAccount)

      await accountRepository.delete('account-1')

      const result = await accountRepository.getById('account-1')
      expect(result).toBeNull()
    })
  })

  describe('syncFromApi', () => {
    it('should save accounts from API', async () => {
      const accounts = [
        createMockAccount({ id: 'account-1', name: 'First' }),
        createMockAccount({ id: 'account-2', name: 'Second' }),
      ]

      await accountRepository.syncFromApi(accounts)

      const result = await accountRepository.getAll()
      expect(result).toHaveLength(2)
    })

    it('should skip dirty accounts during sync', async () => {
      const mockAccount = createMockAccount({ name: 'Local Changes' })
      await accountRepository.save(mockAccount)
      await accountRepository.update('account-1', { name: 'Dirty Local' })

      const apiAccount = createMockAccount({ name: 'API Version' })
      await accountRepository.syncFromApi([apiAccount])

      const result = await accountRepository.getById('account-1')
      expect(result?.name).toBe('Dirty Local') // Should keep local dirty version
    })

    it('should skip invalid accounts', async () => {
      const validAccount = createMockAccount({ id: 'account-1', name: 'Valid' })
      const invalidAccount = { id: '', name: '' } as AccountDto

      await accountRepository.syncFromApi([validAccount, invalidAccount])

      const result = await accountRepository.getAll()
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('account-1')
    })
  })

  describe('clear', () => {
    it('should clear all accounts', async () => {
      const accounts = [
        createMockAccount({ id: 'account-1' }),
        createMockAccount({ id: 'account-2' }),
      ]

      await accountRepository.saveMany(accounts)
      await accountRepository.clear()

      const result = await accountRepository.getAll()
      expect(result).toEqual([])
    })
  })
})
