import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  enqueueCreateAccount,
  enqueueUpdateAccount,
  enqueueDeleteAccount,
  enqueueReorderAccounts,
  enqueueToggleExcluded,
  isTempId,
} from '../outbox-helpers'
import { db } from '@/lib/local/db'
import type {
  CreateAccountDto,
  UpdateAccountDto,
} from '@/features/account/types'

vi.mock('@/lib/local/config', () => ({
  LOCAL_DATA_MODE: 'dexie',
}))

describe('account outbox helpers', () => {
  beforeEach(async () => {
    await db.outbox.clear()
  })

  describe('isTempId', () => {
    it('should return true for temp IDs', () => {
      expect(isTempId('temp-123456')).toBe(true)
      expect(isTempId('temp-')).toBe(true)
    })

    it('should return false for non-temp IDs', () => {
      expect(isTempId('account-123')).toBe(false)
      expect(isTempId('123456')).toBe(false)
      expect(isTempId('')).toBe(false)
    })
  })

  describe('enqueueCreateAccount', () => {
    it('should create outbox entry for account creation', async () => {
      const tempId = 'temp-123456'
      const data: CreateAccountDto = {
        name: 'Test Account',
        color: '#FF0000',
        icon: 'wallet',
        balance: 1000,
        scale: 2,
        currency: 'usd-id',
      }

      await enqueueCreateAccount(tempId, data)

      const entries = await db.outbox.toArray()
      expect(entries).toHaveLength(1)
      expect(entries[0].entity).toBe('account')
      expect(entries[0].action).toBe('create')
      expect(entries[0].entityId).toBe(tempId)
      expect(entries[0].payload).toEqual(data)
      expect(entries[0].status).toBe('pending')
    })
  })

  describe('enqueueUpdateAccount', () => {
    it('should create outbox entry for account update', async () => {
      const id = 'account-123'
      const data: UpdateAccountDto = {
        name: 'Updated Account',
        color: '#00FF00',
      }

      await enqueueUpdateAccount(id, data)

      const entries = await db.outbox.toArray()
      expect(entries).toHaveLength(1)
      expect(entries[0].entity).toBe('account')
      expect(entries[0].action).toBe('update')
      expect(entries[0].entityId).toBe(id)
      expect(entries[0].payload).toEqual(data)
      expect(entries[0].status).toBe('pending')
    })
  })

  describe('enqueueDeleteAccount', () => {
    it('should create outbox entry for account deletion', async () => {
      const id = 'account-123'

      await enqueueDeleteAccount(id)

      const entries = await db.outbox.toArray()
      expect(entries).toHaveLength(1)
      expect(entries[0].entity).toBe('account')
      expect(entries[0].action).toBe('delete')
      expect(entries[0].entityId).toBe(id)
      expect(entries[0].payload).toBeUndefined()
      expect(entries[0].status).toBe('pending')
    })
  })

  describe('enqueueReorderAccounts', () => {
    it('should create outbox entry for account reorder', async () => {
      const ids = ['account-1', 'account-2', 'account-3']

      await enqueueReorderAccounts(ids)

      const entries = await db.outbox.toArray()
      expect(entries).toHaveLength(1)
      expect(entries[0].entity).toBe('account')
      expect(entries[0].action).toBe('update')
      expect(entries[0].entityId).toBe('bulk-reorder')
      expect(entries[0].payload).toEqual({ ids })
      expect(entries[0].status).toBe('pending')
    })
  })

  describe('enqueueToggleExcluded', () => {
    it('should create outbox entry for toggle excluded', async () => {
      const id = 'account-123'

      await enqueueToggleExcluded(id)

      const entries = await db.outbox.toArray()
      expect(entries).toHaveLength(1)
      expect(entries[0].entity).toBe('account')
      expect(entries[0].action).toBe('update')
      expect(entries[0].entityId).toBe(id)
      expect(entries[0].payload).toEqual({ toggleExcluded: true })
      expect(entries[0].status).toBe('pending')
    })
  })
})
