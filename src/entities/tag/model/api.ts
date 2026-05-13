import { queryClient } from '@/shared/api'
import {
  tagControllerCreate,
  tagControllerFindAll,
  tagControllerFindOne,
  tagControllerRemove,
  tagControllerUpdate,
} from '@/shared/api/generated/tags/tags'
import type { TagDto, TagFormValues, UpdateTagDto } from './types'

const QUERY_KEY = ['tags'] as const

export const tagApi = {
  list: (): Promise<TagDto[]> => tagControllerFindAll(),

  getById: (id: string): Promise<TagDto> => tagControllerFindOne(id),

  create: (data: TagFormValues): Promise<TagDto> => tagControllerCreate(data),

  update: (id: string, data: UpdateTagDto): Promise<TagDto> =>
    tagControllerUpdate(id, data),

  delete: (id: string): Promise<void> => tagControllerRemove(id),

  invalidate: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
}
