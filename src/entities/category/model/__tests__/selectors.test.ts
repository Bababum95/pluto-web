import { describe, it, expect } from 'vitest'
import { configureStore } from '@reduxjs/toolkit'

import type { RootState } from '@/app/store'
import { createMockCategory, mockCategory } from '@/testing/data/category'

import categoryReducer, { setCategories } from '../category.slice'
import {
  selectCategories,
  selectCategoriesStatus,
  selectCategoryById,
} from '../selectors'

function state(category: RootState['category']): RootState {
  return { category } as RootState
}

function createCategoryTestStore() {
  return configureStore({
    reducer: {
      category: categoryReducer,
    },
  })
}

describe('category selectors', () => {
  it('selectCategories returns categories', () => {
    const store = createCategoryTestStore()
    const categories = [mockCategory]

    store.dispatch(setCategories(categories))

    expect(selectCategories(state(store.getState().category))).toEqual(
      categories
    )
  })

  it('selectCategoriesStatus returns status', () => {
    expect(
      selectCategoriesStatus(state({ categories: [], status: 'pending' }))
    ).toBe('pending')
  })

  it('selectCategoryById returns matching category', () => {
    const other = createMockCategory({ id: 'category-2', name: 'Transport' })

    expect(
      selectCategoryById(
        state({ categories: [mockCategory, other], status: 'success' }),
        mockCategory.id
      )
    ).toEqual(mockCategory)
  })

  it('selectCategoryById returns undefined when id is missing', () => {
    expect(
      selectCategoryById(
        state({ categories: [mockCategory], status: 'success' }),
        'missing'
      )
    ).toBeUndefined()
  })
})
