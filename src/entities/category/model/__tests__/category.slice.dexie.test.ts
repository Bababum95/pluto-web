import { configureStore } from '@reduxjs/toolkit'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import categoryReducer, {
  fetchCategories,
  createCategory,
  updateCategory,
  reorderCategories,
  deleteCategory,
  setCategories,
} from '../category.slice'
import transactionTypeReducer from '@/app/store/slices/transaction-type'
import { categoryApi } from '../api'
import { categoryRepository } from '../../local/repository'
import {
  enqueueCreateCategory,
  enqueueUpdateCategory,
  enqueueDeleteCategory,
  enqueueReorderCategories,
} from '../../local/outbox-helpers'
import { DEFAULT_CATEGORY_FORM_VALUES } from '../constants'
import { generateTempEntityId } from '@/shared/lib/local-storage/temp-id'
import type { CategoryDto } from '../types'

vi.mock('@/shared/lib/local-storage/temp-id', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/shared/lib/local-storage/temp-id')>()
  return {
    ...actual,
    generateTempEntityId: vi.fn(actual.generateTempEntityId),
  }
})

vi.mock('@/shared/lib/local-storage/config', () => ({
  LOCAL_DATA_MODE: 'dexie' as const,
  getLocalDataMode: (): 'dexie' | 'api-only' => 'dexie',
}))

vi.mock('../api')
vi.mock('../../local/repository')
vi.mock('../../local/outbox-helpers')

function createCategoryTestStore() {
  return configureStore({
    reducer: {
      category: categoryReducer,
      transactionType: transactionTypeReducer,
    },
  })
}

type CategoryTestStore = ReturnType<typeof createCategoryTestStore>

describe('category.slice (dexie mode)', () => {
  let store: CategoryTestStore

  beforeEach(() => {
    store = createCategoryTestStore()
    vi.clearAllMocks()
  })

  describe('fetchCategories', () => {
    it('fetches categories from local storage when available', async () => {
      const mockCategories: CategoryDto[] = [
        {
          id: '1',
          name: 'Food',
          color: '#ff0000',
          icon: 'food',
          type: 'expense',
          order: 0,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ]

      vi.mocked(categoryRepository.getAll).mockResolvedValue(mockCategories)
      vi.mocked(categoryApi.list).mockResolvedValue(mockCategories)

      await store.dispatch(fetchCategories())

      expect(categoryRepository.getAll).toHaveBeenCalled()
      expect(store.getState().category.categories).toEqual(mockCategories)
      expect(store.getState().category.status).toBe('success')
    })

    it('fetches from API and saves to local storage when local is empty', async () => {
      const mockCategories: CategoryDto[] = [
        {
          id: '1',
          name: 'Food',
          color: '#ff0000',
          icon: 'food',
          type: 'expense',
          order: 0,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ]

      vi.mocked(categoryRepository.getAll).mockResolvedValue([])
      vi.mocked(categoryApi.list).mockResolvedValue(mockCategories)

      await store.dispatch(fetchCategories())

      expect(categoryRepository.getAll).toHaveBeenCalled()
      expect(categoryApi.list).toHaveBeenCalled()
      expect(categoryRepository.saveMany).toHaveBeenCalledWith(mockCategories)
      expect(store.getState().category.categories).toEqual(mockCategories)
    })

    it('sets status to pending while fetching', async () => {
      vi.mocked(categoryRepository.getAll).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      )

      const promise = store.dispatch(fetchCategories())

      expect(store.getState().category.status).toBe('pending')

      await promise
    })

    it('sets status to failed on error', async () => {
      vi.mocked(categoryRepository.getAll).mockRejectedValue(
        new Error('DB error')
      )

      await store.dispatch(fetchCategories())

      expect(store.getState().category.status).toBe('failed')
    })
  })

  describe('createCategory', () => {
    it('creates category locally with temp ID', async () => {
      const formData = { name: 'Food', color: '#ff0000', icon: 'food' }

      await store.dispatch(createCategory(formData))

      expect(categoryRepository.save).toHaveBeenCalled()
      expect(enqueueCreateCategory).toHaveBeenCalled()
      expect(store.getState().category.categories).toHaveLength(1)
      expect(store.getState().category.categories[0].id).toMatch(/^temp-/)
      expect(store.getState().category.categories[0].name).toBe('Food')
      expect(store.getState().category.status).toBe('success')
    })

    it('sets status to pending while creating', async () => {
      vi.mocked(categoryRepository.save).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      )

      const promise = store.dispatch(
        createCategory({ ...DEFAULT_CATEGORY_FORM_VALUES, name: 'Food' })
      )

      expect(store.getState().category.status).toBe('pending')

      await promise
    })

    it('does not add duplicate category if it already exists', async () => {
      const formData = { name: 'Food', color: '#ff0000', icon: 'food' }

      vi.mocked(generateTempEntityId).mockReturnValue('temp-1')

      await store.dispatch(createCategory(formData))
      const firstCategory = store.getState().category.categories[0]

      vi.mocked(categoryRepository.save).mockResolvedValue()
      vi.mocked(enqueueCreateCategory).mockResolvedValue()

      await store.dispatch(createCategory(formData))

      expect(store.getState().category.categories).toHaveLength(1)
      expect(store.getState().category.categories[0]).toEqual(firstCategory)
    })

    it('sets status to failed on error', async () => {
      vi.mocked(categoryRepository.save).mockRejectedValue(
        new Error('DB error')
      )

      await store.dispatch(
        createCategory({ ...DEFAULT_CATEGORY_FORM_VALUES, name: 'Food' })
      )

      expect(store.getState().category.status).toBe('failed')
    })
  })

  describe('updateCategory', () => {
    it('updates category locally', async () => {
      const existingCategory: CategoryDto = {
        id: '1',
        name: 'Food',
        color: '#ff0000',
        icon: 'food',
        type: 'expense',
        order: 0,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      }

      const updatedCategory: CategoryDto = {
        ...existingCategory,
        name: 'Groceries',
        color: '#00ff00',
        updatedAt: '2024-01-02T00:00:00Z',
      }

      store.dispatch(setCategories([existingCategory]))
      vi.mocked(categoryRepository.update).mockResolvedValue()
      vi.mocked(categoryRepository.getById).mockResolvedValue(updatedCategory)
      vi.mocked(enqueueUpdateCategory).mockResolvedValue()

      const updateData = { name: 'Groceries', color: '#00ff00', icon: 'food' }

      const result = await store.dispatch(
        updateCategory({ id: '1', data: updateData })
      )

      expect(result.type).toBe('category/updateCategory/fulfilled')
      expect(categoryRepository.update).toHaveBeenCalledWith('1', {
        ...updateData,
        type: 'expense',
      })
      expect(enqueueUpdateCategory).toHaveBeenCalledWith('1', {
        ...updateData,
        type: 'expense',
      })
      expect(store.getState().category.categories[0].name).toBe('Groceries')
    })

    it('rejects when category not found after update', async () => {
      vi.mocked(categoryRepository.update).mockResolvedValue()
      vi.mocked(categoryRepository.getById).mockResolvedValue(null)

      const result = await store.dispatch(
        updateCategory({
          id: '1',
          data: { ...DEFAULT_CATEGORY_FORM_VALUES, name: 'Updated' },
        })
      )

      if (updateCategory.rejected.match(result)) {
        expect(result.error.message).toBe('Category 1 not found after update')
      } else {
        expect.fail(`expected rejected, got ${result.type}`)
      }
    })
  })

  describe('reorderCategories', () => {
    it('reorders categories locally', async () => {
      const categories: CategoryDto[] = [
        {
          id: '1',
          name: 'Food',
          color: '#ff0000',
          icon: 'food',
          type: 'expense',
          order: 0,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          name: 'Transport',
          color: '#00ff00',
          icon: 'car',
          type: 'expense',
          order: 1,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ]

      store.dispatch(setCategories(categories))

      vi.mocked(categoryRepository.update).mockResolvedValue()
      vi.mocked(enqueueReorderCategories).mockResolvedValue()

      await store.dispatch(reorderCategories(['2', '1']))

      expect(categoryRepository.update).toHaveBeenCalledWith('2', { order: 0 })
      expect(categoryRepository.update).toHaveBeenCalledWith('1', { order: 1 })
      expect(enqueueReorderCategories).toHaveBeenCalledWith(['2', '1'])
      expect(store.getState().category.categories[0].id).toBe('2')
      expect(store.getState().category.categories[1].id).toBe('1')
    })
  })

  describe('deleteCategory', () => {
    it('deletes category locally', async () => {
      const categories: CategoryDto[] = [
        {
          id: '1',
          name: 'Food',
          color: '#ff0000',
          icon: 'food',
          type: 'expense',
          order: 0,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          name: 'Transport',
          color: '#00ff00',
          icon: 'car',
          type: 'expense',
          order: 1,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ]

      store.dispatch(setCategories(categories))

      await store.dispatch(deleteCategory('1'))

      expect(categoryRepository.delete).toHaveBeenCalledWith('1')
      expect(enqueueDeleteCategory).toHaveBeenCalledWith('1')
      expect(store.getState().category.categories).toHaveLength(1)
      expect(store.getState().category.categories[0].id).toBe('2')
    })
  })
})
