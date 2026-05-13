import { describe, it, expect, beforeEach, vi } from 'vitest'
import { userRepository } from '../repository'
import { db } from '@/lib/local/db'
import type { UserDto } from '@/lib/api/generated/model'

// Mock LOCAL_DATA_MODE at module level
let mockLocalDataMode = 'dexie'
vi.mock('@/lib/local/config', () => ({
  get LOCAL_DATA_MODE() {
    return mockLocalDataMode
  },
}))

describe('userRepository', () => {
  const mockUser: UserDto = {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  }

  beforeEach(async () => {
    mockLocalDataMode = 'dexie'
    await db.users.clear()
  })

  describe('getById', () => {
    it('should return user when found', async () => {
      await db.users.add({
        id: mockUser.id,
        payload: mockUser,
        updatedAt: mockUser.updatedAt,
      })

      const result = await userRepository.getById(mockUser.id)

      expect(result).toEqual(mockUser)
    })

    it('should return null when user not found', async () => {
      const result = await userRepository.getById('non-existent')

      expect(result).toBeNull()
    })

    it('should return null in api-only mode', async () => {
      mockLocalDataMode = 'api-only'

      await db.users.add({
        id: mockUser.id,
        payload: mockUser,
        updatedAt: mockUser.updatedAt,
      })

      const result = await userRepository.getById(mockUser.id)

      expect(result).toBeNull()
    })
  })

  describe('getAll', () => {
    it('should return all users', async () => {
      const user1: UserDto = { ...mockUser, id: 'user-1', name: 'User 1' }
      const user2: UserDto = { ...mockUser, id: 'user-2', name: 'User 2' }

      await db.users.bulkAdd([
        { id: user1.id, payload: user1, updatedAt: user1.updatedAt },
        { id: user2.id, payload: user2, updatedAt: user2.updatedAt },
      ])

      const result = await userRepository.getAll()

      expect(result).toHaveLength(2)
      expect(result).toContainEqual(user1)
      expect(result).toContainEqual(user2)
    })

    it('should return empty array when no users', async () => {
      const result = await userRepository.getAll()

      expect(result).toEqual([])
    })

    it('should return empty array in api-only mode', async () => {
      mockLocalDataMode = 'api-only'

      await db.users.add({
        id: mockUser.id,
        payload: mockUser,
        updatedAt: mockUser.updatedAt,
      })

      const result = await userRepository.getAll()

      expect(result).toEqual([])
    })
  })

  describe('save', () => {
    it('should save user to local database', async () => {
      await userRepository.save(mockUser)

      const saved = await db.users.get(mockUser.id)
      expect(saved).toBeDefined()
      expect(saved?.payload).toEqual(mockUser)
      expect(saved?.updatedAt).toBeDefined()
    })

    it('should mark user as not dirty on initial save', async () => {
      await userRepository.save(mockUser)

      const saved = await db.users.get(mockUser.id)
      expect(saved?.isDirty).toBeFalsy()
    })

    it('should update existing user', async () => {
      await db.users.add({
        id: mockUser.id,
        payload: mockUser,
        updatedAt: '2024-01-01T00:00:00.000Z',
      })

      const updated = { ...mockUser, name: 'Updated Name' }
      await userRepository.save(updated)

      const saved = await db.users.get(mockUser.id)
      expect(saved?.payload.name).toBe('Updated Name')
    })

    it('should not save in api-only mode', async () => {
      mockLocalDataMode = 'api-only'

      await userRepository.save(mockUser)

      const saved = await db.users.get(mockUser.id)
      expect(saved).toBeUndefined()
    })
  })

  describe('update', () => {
    it('should update user and mark as dirty', async () => {
      await db.users.add({
        id: mockUser.id,
        payload: mockUser,
        updatedAt: mockUser.updatedAt,
      })

      await userRepository.update(mockUser.id, { name: 'Updated Name' })

      const updated = await db.users.get(mockUser.id)
      expect(updated?.payload.name).toBe('Updated Name')
      expect(updated?.isDirty).toBe(true)
    })

    it('should not throw if user not found', async () => {
      await expect(
        userRepository.update('non-existent', { name: 'Test' })
      ).resolves.not.toThrow()
    })

    it('should not update in api-only mode', async () => {
      mockLocalDataMode = 'api-only'

      await db.users.add({
        id: mockUser.id,
        payload: mockUser,
        updatedAt: mockUser.updatedAt,
      })

      await userRepository.update(mockUser.id, { name: 'Updated' })

      const user = await db.users.get(mockUser.id)
      expect(user?.payload.name).toBe(mockUser.name)
    })
  })

  describe('delete', () => {
    it('should delete user from local database', async () => {
      await db.users.add({
        id: mockUser.id,
        payload: mockUser,
        updatedAt: mockUser.updatedAt,
      })

      await userRepository.delete(mockUser.id)

      const deleted = await db.users.get(mockUser.id)
      expect(deleted).toBeUndefined()
    })

    it('should not throw if user does not exist', async () => {
      await expect(userRepository.delete('non-existent')).resolves.not.toThrow()
    })

    it('should not delete in api-only mode', async () => {
      mockLocalDataMode = 'api-only'

      await db.users.add({
        id: mockUser.id,
        payload: mockUser,
        updatedAt: mockUser.updatedAt,
      })

      await userRepository.delete(mockUser.id)

      const user = await db.users.get(mockUser.id)
      expect(user).toBeDefined()
    })
  })

  describe('syncFromApi', () => {
    it('should update local user if server is newer', async () => {
      await db.users.add({
        id: mockUser.id,
        payload: mockUser,
        updatedAt: '2024-01-01T00:00:00.000Z',
      })

      const newerUser = {
        ...mockUser,
        name: 'Updated from API',
        updatedAt: '2024-01-02T00:00:00.000Z',
      }

      await userRepository.syncFromApi(newerUser)

      const synced = await db.users.get(mockUser.id)
      expect(synced?.payload.name).toBe('Updated from API')
      expect(synced?.syncedAt).toBeDefined()
    })

    it('should not update if local is newer', async () => {
      await db.users.add({
        id: mockUser.id,
        payload: mockUser,
        updatedAt: '2024-01-02T00:00:00.000Z',
      })

      const olderUser = {
        ...mockUser,
        name: 'Older from API',
        updatedAt: '2024-01-01T00:00:00.000Z',
      }

      await userRepository.syncFromApi(olderUser)

      const synced = await db.users.get(mockUser.id)
      expect(synced?.payload.name).toBe(mockUser.name)
    })

    it('should not update if local is dirty', async () => {
      await db.users.add({
        id: mockUser.id,
        payload: mockUser,
        updatedAt: '2024-01-01T00:00:00.000Z',
        isDirty: true,
      })

      const newerUser = {
        ...mockUser,
        name: 'Updated from API',
        updatedAt: '2024-01-02T00:00:00.000Z',
      }

      await userRepository.syncFromApi(newerUser)

      const synced = await db.users.get(mockUser.id)
      expect(synced?.payload.name).toBe(mockUser.name)
      expect(synced?.isDirty).toBe(true)
    })

    it('should create user if not exists locally', async () => {
      await userRepository.syncFromApi(mockUser)

      const synced = await db.users.get(mockUser.id)
      expect(synced?.payload).toEqual(mockUser)
      expect(synced?.syncedAt).toBeDefined()
    })

    it('should not sync in api-only mode', async () => {
      mockLocalDataMode = 'api-only'

      await userRepository.syncFromApi(mockUser)

      const synced = await db.users.get(mockUser.id)
      expect(synced).toBeUndefined()
    })
  })

  describe('syncToApi', () => {
    it('should clear dirty flag after successful sync', async () => {
      await db.users.add({
        id: mockUser.id,
        payload: mockUser,
        updatedAt: mockUser.updatedAt,
        isDirty: true,
      })

      await userRepository.syncToApi(mockUser.id)

      const synced = await db.users.get(mockUser.id)
      expect(synced?.isDirty).toBeFalsy()
      expect(synced?.syncedAt).toBeDefined()
    })

    it('should not throw if user not found', async () => {
      await expect(
        userRepository.syncToApi('non-existent')
      ).resolves.not.toThrow()
    })

    it('should not sync in api-only mode', async () => {
      mockLocalDataMode = 'api-only'

      await db.users.add({
        id: mockUser.id,
        payload: mockUser,
        updatedAt: mockUser.updatedAt,
        isDirty: true,
      })

      await userRepository.syncToApi(mockUser.id)

      const user = await db.users.get(mockUser.id)
      expect(user?.isDirty).toBe(true)
    })
  })

  describe('clear', () => {
    it('should remove all users', async () => {
      await db.users.bulkAdd([
        { id: 'user-1', payload: mockUser, updatedAt: mockUser.updatedAt },
        { id: 'user-2', payload: mockUser, updatedAt: mockUser.updatedAt },
      ])

      await userRepository.clear()

      const remaining = await db.users.toArray()
      expect(remaining).toHaveLength(0)
    })

    it('should work when no users exist', async () => {
      await expect(userRepository.clear()).resolves.not.toThrow()
    })

    it('should not clear in api-only mode', async () => {
      mockLocalDataMode = 'api-only'

      await db.users.add({
        id: mockUser.id,
        payload: mockUser,
        updatedAt: mockUser.updatedAt,
      })

      await userRepository.clear()

      const remaining = await db.users.toArray()
      expect(remaining).toHaveLength(1)
    })
  })

  describe('edge cases', () => {
    it('should handle concurrent saves', async () => {
      const user1 = { ...mockUser, id: 'user-1' }
      const user2 = { ...mockUser, id: 'user-2' }

      await Promise.all([
        userRepository.save(user1),
        userRepository.save(user2),
      ])

      const saved1 = await db.users.get('user-1')
      const saved2 = await db.users.get('user-2')

      expect(saved1).toBeDefined()
      expect(saved2).toBeDefined()
    })

    it('should handle partial updates', async () => {
      await db.users.add({
        id: mockUser.id,
        payload: mockUser,
        updatedAt: mockUser.updatedAt,
      })

      await userRepository.update(mockUser.id, { name: 'New Name' })

      const updated = await db.users.get(mockUser.id)
      expect(updated?.payload.name).toBe('New Name')
      expect(updated?.payload.email).toBe(mockUser.email)
    })

    it('should preserve timestamps on update', async () => {
      const originalTimestamp = '2024-01-01T00:00:00.000Z'
      await db.users.add({
        id: mockUser.id,
        payload: { ...mockUser, createdAt: originalTimestamp },
        updatedAt: originalTimestamp,
      })

      await userRepository.update(mockUser.id, { name: 'Updated' })

      const updated = await db.users.get(mockUser.id)
      expect(updated?.payload.createdAt).toBe(originalTimestamp)
    })
  })
})
