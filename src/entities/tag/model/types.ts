import type { CreateTagDto, TagDto } from '@/lib/api/generated/model'

export type UpdateTagDto = Partial<
  Pick<CreateTagDto, 'name' | 'color' | 'icon'>
>

export type TagFormValues = {
  name: string
  color?: string
  icon?: string
}

export type { CreateTagDto, TagDto }
