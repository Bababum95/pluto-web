import { describe, it, expect, vi } from 'vitest'

vi.mock('@/store', () => ({
  createStore: vi.fn(() => ({ getState: vi.fn(() => ({})) })),
}))

import categoryReducer, {
  fetchCategories,
  createCategory,
  updateCategory,
  reorderCategories,
  setCategories,
  addCategory,
  removeCategory,
} from './index'
import { mockCategory, createMockCategory } from '@/testing/data/category'

const category2 = createMockCategory({
  id: 'category-2',
  name: 'Transport',
  order: 1,
})

describe('category slice', () => {
  describe('reducers', () => {
    it('setCategories replaces list', () => {
      const state = categoryReducer(
        undefined,
        setCategories([mockCategory, category2])
      )
      expect(state.categories).toHaveLength(2)
      expect(state.categories[0].id).toBe(mockCategory.id)
      expect(state.categories[1].id).toBe('category-2')
    })

    it('addCategory appends category', () => {
      let state = categoryReducer(undefined, setCategories([mockCategory]))
      state = categoryReducer(state, addCategory(category2))
      expect(state.categories).toHaveLength(2)
      expect(state.categories[1].name).toBe('Transport')
    })

    it('removeCategory removes by id', () => {
      let state = categoryReducer(
        undefined,
        setCategories([mockCategory, category2])
      )
      state = categoryReducer(state, removeCategory(mockCategory.id))
      expect(state.categories).toHaveLength(1)
      expect(state.categories[0].id).toBe('category-2')
    })
  })

  describe('fetchCategories', () => {
    it('pending sets status to pending', () => {
      const state = categoryReducer(
        undefined,
        fetchCategories.pending('req-1', undefined)
      )
      expect(state.status).toBe('pending')
    })

    it('fulfilled sets categories', () => {
      const list = [mockCategory, category2]
      const action = fetchCategories.fulfilled(list, 'req-1', undefined)
      const state = categoryReducer(undefined, action)
      expect(state.status).toBe('success')
      expect(state.categories).toEqual(list)
    })

    it('rejected sets status to failed', () => {
      const state = categoryReducer(
        undefined,
        fetchCategories.rejected(new Error('fail'), 'req-1', undefined)
      )
      expect(state.status).toBe('failed')
    })
  })

  describe('createCategory', () => {
    it('pending sets status to pending', () => {
      const state = categoryReducer(
        undefined,
        createCategory.pending('req-1', {} as never)
      )
      expect(state.status).toBe('pending')
    })

    it('fulfilled appends category', () => {
      const newCategory = createMockCategory({
        id: 'category-new',
        name: 'Shopping',
      })
      let state = categoryReducer(undefined, setCategories([mockCategory]))
      const action = createCategory.fulfilled(newCategory, 'req-1', {} as never)
      state = categoryReducer(state, action)
      expect(state.status).toBe('success')
      expect(state.categories).toHaveLength(2)
      expect(state.categories[1]).toEqual(newCategory)
    })

    it('rejected sets status to failed', () => {
      const state = categoryReducer(
        undefined,
        createCategory.rejected(new Error('fail'), 'req-1', {} as never)
      )
      expect(state.status).toBe('failed')
    })
  })

  describe('updateCategory', () => {
    it('fulfilled updates category in list by id', () => {
      const updated = createMockCategory({
        id: mockCategory.id,
        name: 'Updated Name',
      })
      let state = categoryReducer(
        undefined,
        fetchCategories.fulfilled([mockCategory, category2], 'req-1', undefined)
      )
      const action = updateCategory.fulfilled(updated, 'req-1', {
        id: mockCategory.id,
        data: {} as never,
      })
      state = categoryReducer(state, action)
      expect(state.categories[0].name).toBe('Updated Name')
      expect(state.categories[1]).toEqual(category2)
    })
  })

  describe('reorderCategories', () => {
    it('fulfilled reorders by ids and sets order field', () => {
      let state = categoryReducer(
        undefined,
        fetchCategories.fulfilled(
          [
            { ...mockCategory, id: 'a', order: 0 },
            { ...category2, id: 'b', order: 1 },
          ],
          'req-1',
          undefined
        )
      )
      const action = reorderCategories.fulfilled(undefined, 'req-1', ['b', 'a'])
      state = categoryReducer(state, action)
      expect(state.categories).toHaveLength(2)
      expect(state.categories[0].id).toBe('b')
      expect(state.categories[0].order).toBe(0)
      expect(state.categories[1].id).toBe('a')
      expect(state.categories[1].order).toBe(1)
    })
  })
})
