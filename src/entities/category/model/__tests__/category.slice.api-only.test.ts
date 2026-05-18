import { configureStore } from '@reduxjs/toolkit'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import transactionTypeReducer from '../../../../app/store/slices/transaction-type'
import categoryReducer, {
  fetchCategories,
  createCategory,
  updateCategory,
  reorderCategories,
  deleteCategory,
  setCategories,
} from '../category.slice'
import { categoryApi } from '../api'
import { DEFAULT_CATEGORY_FORM_VALUES } from '../constants'
import type { CategoryDto } from '../types'

vi.mock('@/shared/lib/local-storage/config', () => ({
  LOCAL_DATA_MODE: 'api-only' as const,
  getLocalDataMode: (): 'dexie' | 'api-only' => 'api-only',
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

describe('category.slice (api-only mode)', () => {
  let store: CategoryTestStore

  beforeEach(() => {
    store = createCategoryTestStore()
    vi.clearAllMocks()
  })

  describe('fetchCategories', () => {
    it('fetches categories from API', async () => {
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

      vi.mocked(categoryApi.list).mockResolvedValue(mockCategories)

      await store.dispatch(fetchCategories())

      expect(categoryApi.list).toHaveBeenCalled()
      expect(store.getState().category.categories).toEqual(mockCategories)
      expect(store.getState().category.status).toBe('success')
    })

    it('sets status to pending while fetching', async () => {
      vi.mocked(categoryApi.list).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      )

      const promise = store.dispatch(fetchCategories())

      expect(store.getState().category.status).toBe('pending')

      await promise
    })

    it('sets status to failed on error', async () => {
      vi.mocked(categoryApi.list).mockRejectedValue(new Error('API error'))

      await store.dispatch(fetchCategories())

      expect(store.getState().category.status).toBe('failed')
    })
  })

  describe('createCategory', () => {
    it('creates category via API', async () => {
      const formData = { name: 'Food', color: '#ff0000', icon: 'food' }
      const mockCategory: CategoryDto = {
        id: '1',
        ...formData,
        type: 'expense',
        order: 0,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      }

      vi.mocked(categoryApi.create).mockResolvedValue(mockCategory)

      await store.dispatch(createCategory(formData))

      expect(categoryApi.create).toHaveBeenCalledWith({
        ...formData,
        type: 'expense',
      })
      expect(store.getState().category.categories).toHaveLength(1)
      expect(store.getState().category.categories[0]).toEqual(mockCategory)
      expect(store.getState().category.status).toBe('success')
    })

    it('does not add duplicate category if it already exists', async () => {
      const formData = { name: 'Food', color: '#ff0000', icon: 'food' }
      const mockCategory: CategoryDto = {
        id: '1',
        ...formData,
        type: 'expense',
        order: 0,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      }

      store.dispatch(setCategories([mockCategory]))
      vi.mocked(categoryApi.create).mockResolvedValue(mockCategory)

      await store.dispatch(createCategory(formData))

      expect(store.getState().category.categories).toHaveLength(1)
    })

    it('sets status to failed on error', async () => {
      vi.mocked(categoryApi.create).mockRejectedValue(new Error('API error'))

      await store.dispatch(
        createCategory({ ...DEFAULT_CATEGORY_FORM_VALUES, name: 'Food' })
      )

      expect(store.getState().category.status).toBe('failed')
    })
  })

  describe('updateCategory', () => {
    it('updates category via API', async () => {
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

      store.dispatch(setCategories([existingCategory]))

      const updateData = { name: 'Groceries', color: '#00ff00', icon: 'cart' }
      const updatedCategory: CategoryDto = {
        ...existingCategory,
        ...updateData,
        updatedAt: '2024-01-02T00:00:00Z',
      }

      vi.mocked(categoryApi.update).mockResolvedValue(updatedCategory)

      await store.dispatch(updateCategory({ id: '1', data: updateData }))

      expect(categoryApi.update).toHaveBeenCalledWith('1', {
        ...updateData,
        type: 'expense',
      })
      expect(store.getState().category.categories[0].name).toBe('Groceries')
    })

    it('does not update state when category not found', async () => {
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

      store.dispatch(setCategories([existingCategory]))

      const updatedCategory: CategoryDto = {
        id: '999',
        name: 'Other',
        color: '#00ff00',
        icon: 'other',
        type: 'expense',
        order: 0,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      }

      vi.mocked(categoryApi.update).mockResolvedValue(updatedCategory)

      await store.dispatch(
        updateCategory({
          id: '999',
          data: { ...DEFAULT_CATEGORY_FORM_VALUES, name: 'Other' },
        })
      )

      expect(store.getState().category.categories).toHaveLength(1)
      expect(store.getState().category.categories[0].id).toBe('1')
    })
  })

  describe('reorderCategories', () => {
    it('reorders categories via API', async () => {
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

      vi.mocked(categoryApi.reorder).mockResolvedValue({ ids: ['2', '1'] })

      await store.dispatch(reorderCategories(['2', '1']))

      expect(categoryApi.reorder).toHaveBeenCalledWith({ ids: ['2', '1'] })
      expect(store.getState().category.categories[0].id).toBe('2')
      expect(store.getState().category.categories[0].order).toBe(0)
      expect(store.getState().category.categories[1].id).toBe('1')
      expect(store.getState().category.categories[1].order).toBe(1)
    })

    it('filters out missing categories during reorder', async () => {
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
      ]

      store.dispatch(setCategories(categories))

      vi.mocked(categoryApi.reorder).mockResolvedValue({ ids: ['1', '999'] })

      await store.dispatch(reorderCategories(['1', '999']))

      expect(store.getState().category.categories).toHaveLength(1)
      expect(store.getState().category.categories[0].id).toBe('1')
    })
  })

  describe('deleteCategory', () => {
    it('deletes category via API', async () => {
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

      vi.mocked(categoryApi.delete).mockResolvedValue(undefined)

      await store.dispatch(deleteCategory('1'))

      expect(categoryApi.delete).toHaveBeenCalledWith('1')
      expect(store.getState().category.categories).toHaveLength(1)
      expect(store.getState().category.categories[0].id).toBe('2')
    })
  })
})
