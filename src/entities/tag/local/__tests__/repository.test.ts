import { describe, it, expect, beforeEach, vi } from 'vitest'
import { tagRepository } from '../repository'
import { db } from '@/shared/lib/local-storage/db'
import type { TagDto } from '../../model/types'

vi.mock('@/shared/lib/local-storage/config', () => ({
  LOCAL_DATA_MODE: 'dexie',
}))

describe('tagRepository', () => {
  beforeEach(async () => {
    await db.tags.clear()
  })

  describe('getById', () => {
    it('should return null when tag does not exist', async () => {
      const result = await tagRepository.getById('non-existent')
      expect(result).toBeNull()
    })

    it('should return tag when it exists', async () => {
      const mockTag: TagDto = {
        id: 'tag-1',
        name: 'Food',
        color: '#FF0000',
        icon: 'food',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      }

      await tagRepository.save(mockTag)

      const result = await tagRepository.getById('tag-1')
      expect(result).toEqual(mockTag)
    })
  })

  describe('getAll', () => {
    it('should return empty array when no tags exist', async () => {
      const result = await tagRepository.getAll()
      expect(result).toEqual([])
    })

    it('should return all tags', async () => {
      const mockTags: TagDto[] = [
        {
          id: 'tag-1',
          name: 'Food',
          color: '#FF0000',
          icon: 'food',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
        {
          id: 'tag-2',
          name: 'Transport',
          color: '#00FF00',
          icon: 'car',
          createdAt: '2024-01-02T00:00:00.000Z',
          updatedAt: '2024-01-02T00:00:00.000Z',
        },
      ]

      await tagRepository.saveMany(mockTags)

      const result = await tagRepository.getAll()
      expect(result).toHaveLength(2)
      expect(result).toEqual(expect.arrayContaining(mockTags))
    })
  })

  describe('save', () => {
    it('should save tag to database', async () => {
      const mockTag: TagDto = {
        id: 'tag-1',
        name: 'Food',
        color: '#FF0000',
        icon: 'food',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      }

      await tagRepository.save(mockTag)

      const row = await db.tags.get('tag-1')
      expect(row).toBeDefined()
      expect(row?.payload).toEqual(mockTag)
      expect(row?.syncedAt).toBeDefined()
    })

    it('should update existing tag', async () => {
      const mockTag1: TagDto = {
        id: 'tag-1',
        name: 'Food',
        color: '#FF0000',
        icon: 'food',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      }

      const mockTag2: TagDto = {
        id: 'tag-1',
        name: 'Food Updated',
        color: '#00FF00',
        icon: 'food-new',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-02T00:00:00.000Z',
      }

      await tagRepository.save(mockTag1)
      await tagRepository.save(mockTag2)

      const result = await tagRepository.getById('tag-1')
      expect(result).toEqual(mockTag2)

      const count = await db.tags.count()
      expect(count).toBe(1)
    })
  })

  describe('saveMany', () => {
    it('should save multiple tags', async () => {
      const mockTags: TagDto[] = [
        {
          id: 'tag-1',
          name: 'Food',
          color: '#FF0000',
          icon: 'food',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
        {
          id: 'tag-2',
          name: 'Transport',
          color: '#00FF00',
          icon: 'car',
          createdAt: '2024-01-02T00:00:00.000Z',
          updatedAt: '2024-01-02T00:00:00.000Z',
        },
      ]

      await tagRepository.saveMany(mockTags)

      const result = await tagRepository.getAll()
      expect(result).toHaveLength(2)
    })
  })

  describe('delete', () => {
    it('should delete tag from database', async () => {
      const mockTag: TagDto = {
        id: 'tag-1',
        name: 'Food',
        color: '#FF0000',
        icon: 'food',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      }

      await tagRepository.save(mockTag)
      await tagRepository.delete('tag-1')

      const result = await tagRepository.getById('tag-1')
      expect(result).toBeNull()
    })
  })

  describe('syncFromApi', () => {
    it('should save tags from API', async () => {
      const mockTags: TagDto[] = [
        {
          id: 'tag-1',
          name: 'Food',
          color: '#FF0000',
          icon: 'food',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
        {
          id: 'tag-2',
          name: 'Transport',
          color: '#00FF00',
          icon: 'car',
          createdAt: '2024-01-02T00:00:00.000Z',
          updatedAt: '2024-01-02T00:00:00.000Z',
        },
      ]

      await tagRepository.syncFromApi(mockTags)

      const result = await tagRepository.getAll()
      expect(result).toHaveLength(2)
      expect(result).toEqual(expect.arrayContaining(mockTags))
    })
  })

  describe('clear', () => {
    it('should clear all tags', async () => {
      const mockTags: TagDto[] = [
        {
          id: 'tag-1',
          name: 'Food',
          color: '#FF0000',
          icon: 'food',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      ]

      await tagRepository.saveMany(mockTags)
      await tagRepository.clear()

      const result = await tagRepository.getAll()
      expect(result).toEqual([])
    })
  })
})
