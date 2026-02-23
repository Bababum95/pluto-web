import type { components } from '@/lib/api/types'

export type Tag = components['schemas']['TagDto']

export type CreateTagDto = components['schemas']['CreateTagDto']
export type UpdateTagDto = Partial<Pick<CreateTagDto, 'name' | 'color' | 'icon'>>

export type TagFormValues = {
  name: string
  color?: string
  icon?: string
}
