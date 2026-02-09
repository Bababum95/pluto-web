import type { components } from '@/lib/api/types'

export type Category = components['schemas']['CategoryDto']

export type CreateCategoryDto = components['schemas']['CreateCategoryDto']
export type UpdateCategoryDto = Partial<CreateCategoryDto>
