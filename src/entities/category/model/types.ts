import type { CategoryDto, CreateCategoryDto } from '@/shared/api/generated/model'

export type UpdateCategoryDto = Partial<CreateCategoryDto>
export type CategoryFormValues = Omit<CreateCategoryDto, 'type'>

export type { CreateCategoryDto, CategoryDto }
