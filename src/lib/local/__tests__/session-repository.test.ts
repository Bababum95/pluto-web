import { describe, it, expect, beforeEach } from 'vitest'
import { sessionRepository } from '../session-repository'
import { db } from '../db'

describe('sessionRepository', () => {
  beforeEach(async () => {
    await db.session.clear()
  })

  describe('getCurrent', () => {
    it('should return current session when exists', async () => {
      await db.session.add({
        id: 'current',
        currentUserId: 'user-1',
        lastSyncAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      })

      const session = await sessionRepository.getCurrent()

      expect(session).toBeDefined()
      expect(session?.id).toBe('current')
      expect(session?.currentUserId).toBe('user-1')
    })

    it('should return undefined when no session exists', async () => {
      const session = await sessionRepository.getCurrent()

      expect(session).toBeUndefined()
    })
  })

  describe('updateCurrentUser', () => {
    it('should create session if not exists', async () => {
      await sessionRepository.updateCurrentUser('user-1')

      const session = await db.session.get('current')
      expect(session).toBeDefined()
      expect(session?.id).toBe('current')
      expect(session?.currentUserId).toBe('user-1')
      expect(session?.updatedAt).toBeDefined()
    })

    it('should update existing session', async () => {
      await db.session.add({
        id: 'current',
        currentUserId: 'user-1',
        updatedAt: '2024-01-01T00:00:00.000Z',
      })

      await sessionRepository.updateCurrentUser('user-2')

      const session = await db.session.get('current')
      expect(session?.currentUserId).toBe('user-2')
    })

    it('should update timestamp on update', async () => {
      const oldTimestamp = '2024-01-01T00:00:00.000Z'
      await db.session.add({
        id: 'current',
        currentUserId: 'user-1',
        updatedAt: oldTimestamp,
      })

      await sessionRepository.updateCurrentUser('user-1')

      const session = await db.session.get('current')
      expect(session?.updatedAt).not.toBe(oldTimestamp)
    })

    it('should handle null userId', async () => {
      await sessionRepository.updateCurrentUser(null)

      const session = await db.session.get('current')
      expect(session?.currentUserId).toBeNull()
    })

    it('should preserve lastSyncAt when updating user', async () => {
      const lastSyncAt = '2024-01-01T00:00:00.000Z'
      await db.session.add({
        id: 'current',
        currentUserId: 'user-1',
        lastSyncAt,
        updatedAt: '2024-01-01T00:00:00.000Z',
      })

      await sessionRepository.updateCurrentUser('user-2')

      const session = await db.session.get('current')
      expect(session?.lastSyncAt).toBe(lastSyncAt)
    })
  })

  describe('updateLastSync', () => {
    it('should update lastSyncAt on existing session', async () => {
      await db.session.add({
        id: 'current',
        currentUserId: 'user-1',
        updatedAt: '2024-01-01T00:00:00.000Z',
      })

      const syncTimestamp = '2024-01-02T00:00:00.000Z'
      await sessionRepository.updateLastSync(syncTimestamp)

      const session = await db.session.get('current')
      expect(session?.lastSyncAt).toBe(syncTimestamp)
    })

    it('should update timestamp on sync', async () => {
      const oldTimestamp = '2024-01-01T00:00:00.000Z'
      await db.session.add({
        id: 'current',
        currentUserId: 'user-1',
        updatedAt: oldTimestamp,
      })

      await sessionRepository.updateLastSync('2024-01-02T00:00:00.000Z')

      const session = await db.session.get('current')
      expect(session?.updatedAt).not.toBe(oldTimestamp)
    })

    it('should not create session if not exists', async () => {
      await sessionRepository.updateLastSync('2024-01-01T00:00:00.000Z')

      const session = await db.session.get('current')
      expect(session).toBeUndefined()
    })

    it('should preserve currentUserId when updating sync', async () => {
      await db.session.add({
        id: 'current',
        currentUserId: 'user-1',
        updatedAt: '2024-01-01T00:00:00.000Z',
      })

      await sessionRepository.updateLastSync('2024-01-02T00:00:00.000Z')

      const session = await db.session.get('current')
      expect(session?.currentUserId).toBe('user-1')
    })
  })

  describe('clear', () => {
    it('should remove current session', async () => {
      await db.session.add({
        id: 'current',
        currentUserId: 'user-1',
        updatedAt: '2024-01-01T00:00:00.000Z',
      })

      await sessionRepository.clear()

      const session = await db.session.get('current')
      expect(session).toBeUndefined()
    })

    it('should not throw if session does not exist', async () => {
      await expect(sessionRepository.clear()).resolves.not.toThrow()
    })
  })

  describe('edge cases', () => {
    it('should handle rapid consecutive updates', async () => {
      await sessionRepository.updateCurrentUser('user-1')
      await sessionRepository.updateCurrentUser('user-2')
      await sessionRepository.updateCurrentUser('user-3')

      const session = await db.session.get('current')
      expect(session?.currentUserId).toBe('user-3')
    })

    it('should handle concurrent user and sync updates', async () => {
      await db.session.add({
        id: 'current',
        currentUserId: 'user-1',
        updatedAt: '2024-01-01T00:00:00.000Z',
      })

      await Promise.all([
        sessionRepository.updateCurrentUser('user-2'),
        sessionRepository.updateLastSync('2024-01-02T00:00:00.000Z'),
      ])

      const session = await db.session.get('current')
      expect(session).toBeDefined()
      // One of the updates should have succeeded
      expect(
        session?.currentUserId === 'user-2' || session?.lastSyncAt
      ).toBeTruthy()
    })

    it('should maintain singleton pattern', async () => {
      await sessionRepository.updateCurrentUser('user-1')
      await sessionRepository.updateCurrentUser('user-2')

      const allSessions = await db.session.toArray()
      expect(allSessions).toHaveLength(1)
      expect(allSessions[0].id).toBe('current')
    })

    it('should handle empty string userId', async () => {
      await sessionRepository.updateCurrentUser('')

      const session = await db.session.get('current')
      expect(session?.currentUserId).toBe('')
    })

    it('should handle ISO timestamp formats', async () => {
      await db.session.add({
        id: 'current',
        currentUserId: 'user-1',
        updatedAt: '2024-01-01T00:00:00.000Z',
      })

      const timestamps = [
        '2024-01-01T00:00:00Z',
        '2024-01-01T00:00:00.000Z',
        '2024-01-01T00:00:00.123Z',
      ]

      for (const timestamp of timestamps) {
        await sessionRepository.updateLastSync(timestamp)
        const session = await db.session.get('current')
        expect(session?.lastSyncAt).toBe(timestamp)
      }
    })
  })

  describe('data integrity', () => {
    it('should not lose data on failed update', async () => {
      await db.session.add({
        id: 'current',
        currentUserId: 'user-1',
        lastSyncAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      })

      // Even if update fails, original data should remain
      try {
        await sessionRepository.updateCurrentUser('user-2')
      } catch {
        // Ignore error
      }

      const session = await db.session.get('current')
      expect(session).toBeDefined()
    })

    it('should handle clear after multiple operations', async () => {
      await sessionRepository.updateCurrentUser('user-1')
      await sessionRepository.updateLastSync('2024-01-01T00:00:00.000Z')
      await sessionRepository.updateCurrentUser('user-2')
      await sessionRepository.clear()

      const session = await db.session.get('current')
      expect(session).toBeUndefined()
    })
  })
})
