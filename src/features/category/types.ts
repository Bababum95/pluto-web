import type { CategoryDto, CreateCategoryDto } from '@/lib/api/generated/model'

export type UpdateCategoryDto = Partial<CreateCategoryDto>
export type CategoryFormValues = Omit<CreateCategoryDto, 'type'>

export type { CreateCategoryDto, CategoryDto }
