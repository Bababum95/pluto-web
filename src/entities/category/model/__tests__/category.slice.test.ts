import { configureStore } from '@reduxjs/toolkit'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import categoryReducer, {
  setCategories,
  addCategory,
  removeCategory,
} from '../category.slice'
import transactionTypeReducer from '../../../../app/store/slices/transaction-type'
import type { CategoryDto } from '../types'

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

describe('category.slice', () => {
  let store: CategoryTestStore

  beforeEach(() => {
    store = createCategoryTestStore()
    vi.clearAllMocks()
  })

  describe('reducers', () => {
    it('setCategories replaces all categories', () => {
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

      expect(store.getState().category.categories).toEqual(categories)
    })

    it('addCategory adds new category when it does not exist', () => {
      const category: CategoryDto = {
        id: '1',
        name: 'Food',
        color: '#ff0000',
        icon: 'food',
        type: 'expense',
        order: 0,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      }

      store.dispatch(addCategory(category))

      expect(store.getState().category.categories).toHaveLength(1)
      expect(store.getState().category.categories[0]).toEqual(category)
    })

    it('addCategory updates existing category when it exists', () => {
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
        ...existingCategory,
        name: 'Groceries',
        updatedAt: '2024-01-02T00:00:00Z',
      }

      store.dispatch(addCategory(updatedCategory))

      expect(store.getState().category.categories).toHaveLength(1)
      expect(store.getState().category.categories[0].name).toBe('Groceries')
    })

    it('removeCategory removes category by id', () => {
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
      store.dispatch(removeCategory('1'))

      expect(store.getState().category.categories).toHaveLength(1)
      expect(store.getState().category.categories[0].id).toBe('2')
    })
  })
})
