import type { RootState } from '@/app/store'
import type { CategoryDto } from './types'

export const selectCategories = (state: RootState): CategoryDto[] =>
  state.category.categories

export const selectCategoriesStatus = (state: RootState) =>
  state.category.status

export const selectCategoryById = (
  state: RootState,
  id: string
): CategoryDto | undefined => state.category.categories.find((c) => c.id === id)
