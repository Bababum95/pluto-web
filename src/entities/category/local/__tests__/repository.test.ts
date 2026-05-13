import { describe, it, expect, beforeEach, vi } from 'vitest'
import { db } from '@/lib/local/db'

import type { CategoryDto } from '../../model/types'

import { categoryRepository } from '../repository'

vi.mock('@/lib/local/config', () => ({
  LOCAL_DATA_MODE: 'dexie',
}))

describe('categoryRepository', () => {
  beforeEach(async () => {
    await db.categories.clear()
  })

  describe('getById', () => {
    it('should return null when category does not exist', async () => {
      const result = await categoryRepository.getById('non-existent')
      expect(result).toBeNull()
    })

    it('should return category when it exists', async () => {
      const mockCategory: CategoryDto = {
        id: 'category-1',
        name: 'Food & Dining',
        color: '#FF5733',
        icon: 'wallet',
        type: 'expense',
        order: 0,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      }

      await categoryRepository.save(mockCategory)

      const result = await categoryRepository.getById('category-1')
      expect(result).toEqual(mockCategory)
    })
  })

  describe('getAll', () => {
    it('should return empty array when no categories exist', async () => {
      const result = await categoryRepository.getAll()
      expect(result).toEqual([])
    })

    it('should return all categories sorted by order', async () => {
      const mockCategories: CategoryDto[] = [
        {
          id: 'category-1',
          name: 'Food',
          color: '#FF0000',
          icon: 'food',
          type: 'expense',
          order: 2,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
        {
          id: 'category-2',
          name: 'Transport',
          color: '#00FF00',
          icon: 'car',
          type: 'expense',
          order: 0,
          createdAt: '2024-01-02T00:00:00.000Z',
          updatedAt: '2024-01-02T00:00:00.000Z',
        },
        {
          id: 'category-3',
          name: 'Entertainment',
          color: '#0000FF',
          icon: 'movie',
          type: 'expense',
          order: 1,
          createdAt: '2024-01-03T00:00:00.000Z',
          updatedAt: '2024-01-03T00:00:00.000Z',
        },
      ]

      await categoryRepository.saveMany(mockCategories)

      const result = await categoryRepository.getAll()
      expect(result).toHaveLength(3)
      // Should be sorted by order field
      expect(result[0].id).toBe('category-2') // order: 0
      expect(result[1].id).toBe('category-3') // order: 1
      expect(result[2].id).toBe('category-1') // order: 2
    })
  })

  describe('save', () => {
    it('should save category to database', async () => {
      const mockCategory: CategoryDto = {
        id: 'category-1',
        name: 'Food',
        color: '#FF0000',
        icon: 'food',
        type: 'expense',
        order: 0,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      }

      await categoryRepository.save(mockCategory)

      const row = await db.categories.get('category-1')
      expect(row).toBeDefined()
      expect(row?.payload).toEqual(mockCategory)
      expect(row?.syncedAt).toBeDefined()
      expect(row?.isDirty).toBe(false)
    })

    it('should update existing category', async () => {
      const mockCategory1: CategoryDto = {
        id: 'category-1',
        name: 'Food',
        color: '#FF0000',
        icon: 'food',
        type: 'expense',
        order: 0,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      }

      const mockCategory2: CategoryDto = {
        id: 'category-1',
        name: 'Food Updated',
        color: '#00FF00',
        icon: 'food-new',
        type: 'expense',
        order: 1,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-02T00:00:00.000Z',
      }

      await categoryRepository.save(mockCategory1)
      await categoryRepository.save(mockCategory2)

      const result = await categoryRepository.getById('category-1')
      expect(result).toEqual(mockCategory2)

      const count = await db.categories.count()
      expect(count).toBe(1)
    })
  })

  describe('saveMany', () => {
    it('should save multiple categories', async () => {
      const mockCategories: CategoryDto[] = [
        {
          id: 'category-1',
          name: 'Food',
          color: '#FF0000',
          icon: 'food',
          type: 'expense',
          order: 0,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
        {
          id: 'category-2',
          name: 'Transport',
          color: '#00FF00',
          icon: 'car',
          type: 'expense',
          order: 1,
          createdAt: '2024-01-02T00:00:00.000Z',
          updatedAt: '2024-01-02T00:00:00.000Z',
        },
      ]

      await categoryRepository.saveMany(mockCategories)

      const result = await categoryRepository.getAll()
      expect(result).toHaveLength(2)
    })
  })

  describe('update', () => {
    it('should update category with dirty flag', async () => {
      const mockCategory: CategoryDto = {
        id: 'category-1',
        name: 'Food',
        color: '#FF0000',
        icon: 'food',
        type: 'expense',
        order: 0,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      }

      await categoryRepository.save(mockCategory)
      await categoryRepository.update('category-1', { name: 'Food Updated' })

      const result = await categoryRepository.getById('category-1')
      expect(result?.name).toBe('Food Updated')

      const row = await db.categories.get('category-1')
      expect(row?.isDirty).toBe(true)
    })

    it('should do nothing when category does not exist', async () => {
      await categoryRepository.update('non-existent', { name: 'Updated' })

      const result = await categoryRepository.getById('non-existent')
      expect(result).toBeNull()
    })
  })

  describe('delete', () => {
    it('should delete category from database', async () => {
      const mockCategory: CategoryDto = {
        id: 'category-1',
        name: 'Food',
        color: '#FF0000',
        icon: 'food',
        type: 'expense',
        order: 0,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      }

      await categoryRepository.save(mockCategory)
      await categoryRepository.delete('category-1')

      const result = await categoryRepository.getById('category-1')
      expect(result).toBeNull()
    })
  })

  describe('syncFromApi', () => {
    it('should save categories from API', async () => {
      const mockCategories: CategoryDto[] = [
        {
          id: 'category-1',
          name: 'Food',
          color: '#FF0000',
          icon: 'food',
          type: 'expense',
          order: 0,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
        {
          id: 'category-2',
          name: 'Transport',
          color: '#00FF00',
          icon: 'car',
          type: 'expense',
          order: 1,
          createdAt: '2024-01-02T00:00:00.000Z',
          updatedAt: '2024-01-02T00:00:00.000Z',
        },
      ]

      await categoryRepository.syncFromApi(mockCategories)

      const result = await categoryRepository.getAll()
      expect(result).toHaveLength(2)
      expect(result).toEqual(expect.arrayContaining(mockCategories))
    })

    it('should not overwrite dirty categories', async () => {
      const localCategory: CategoryDto = {
        id: 'category-1',
        name: 'Food Local',
        color: '#FF0000',
        icon: 'food',
        type: 'expense',
        order: 0,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      }

      await categoryRepository.save(localCategory)
      await categoryRepository.update('category-1', { name: 'Food Modified' })

      const apiCategories: CategoryDto[] = [
        {
          id: 'category-1',
          name: 'Food API',
          color: '#00FF00',
          icon: 'food-api',
          type: 'expense',
          order: 0,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-02T00:00:00.000Z',
        },
      ]

      await categoryRepository.syncFromApi(apiCategories)

      const result = await categoryRepository.getById('category-1')
      expect(result?.name).toBe('Food Modified') // Should keep local dirty version
    })

    it('should skip invalid categories', async () => {
      const mockCategories = [
        {
          id: 'category-1',
          name: 'Food',
          color: '#FF0000',
          icon: 'food',
          type: 'expense',
          order: 0,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
        {
          id: '',
          name: 'Invalid',
          color: '#00FF00',
          icon: 'invalid',
          type: 'expense',
          order: 1,
        },
        {
          id: 'category-3',
          name: '',
          color: '#0000FF',
          icon: 'invalid2',
          type: 'expense',
          order: 2,
        },
      ] as CategoryDto[]

      await categoryRepository.syncFromApi(mockCategories)

      const result = await categoryRepository.getAll()
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('category-1')
    })

    it('should handle invalid input gracefully', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      await categoryRepository.syncFromApi(null as unknown as CategoryDto[])

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'syncFromApi: invalid categories data, expected array'
      )

      consoleErrorSpy.mockRestore()
    })
  })

  describe('clear', () => {
    it('should clear all categories', async () => {
      const mockCategories: CategoryDto[] = [
        {
          id: 'category-1',
          name: 'Food',
          color: '#FF0000',
          icon: 'food',
          type: 'expense',
          order: 0,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      ]

      await categoryRepository.saveMany(mockCategories)
      await categoryRepository.clear()

      const result = await categoryRepository.getAll()
      expect(result).toEqual([])
    })
  })
})
