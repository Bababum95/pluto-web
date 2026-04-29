import { queryClient } from '@/lib/api'
import {
  categoryControllerCreate,
  categoryControllerFindAll,
  categoryControllerFindOne,
  categoryControllerReorder,
  categoryControllerUpdate,
} from '@/lib/api/generated/categories/categories'
import type { CategoryDto, CreateCategoryDto, UpdateCategoryDto } from './types'

const QUERY_KEY = ['categories'] as const

export const categoryApi = {
  list: (): Promise<CategoryDto[]> => categoryControllerFindAll(),

  getById: (id: string): Promise<CategoryDto> => categoryControllerFindOne(id),

  create: (data: CreateCategoryDto): Promise<CategoryDto> =>
    categoryControllerCreate(data),

  update: (id: string, data: UpdateCategoryDto): Promise<CategoryDto> =>
    categoryControllerUpdate(id, data),

  reorder: (data: { ids: string[] }): Promise<unknown> =>
    categoryControllerReorder(data),
  invalidate: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
}
