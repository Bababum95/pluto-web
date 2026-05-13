import { outboxProcessor } from '@/lib/local/outbox-processor'
import type { CreateCategoryDto, UpdateCategoryDto } from '../model/types'

const TEMP_ID_PREFIX = 'temp-'

export const isTempId = (id: string): boolean => id.startsWith(TEMP_ID_PREFIX)

export async function enqueueCreateCategory(
  tempId: string,
  data: CreateCategoryDto
): Promise<void> {
  await outboxProcessor.enqueue({
    entity: 'category',
    action: 'create',
    entityId: tempId,
    payload: data,
  })
}

export async function enqueueUpdateCategory(
  id: string,
  data: UpdateCategoryDto
): Promise<void> {
  await outboxProcessor.enqueue({
    entity: 'category',
    action: 'update',
    entityId: id,
    payload: data,
  })
}

export async function enqueueDeleteCategory(id: string): Promise<void> {
  await outboxProcessor.enqueue({
    entity: 'category',
    action: 'delete',
    entityId: id,
  })
}

export async function enqueueReorderCategories(ids: string[]): Promise<void> {
  await outboxProcessor.enqueue({
    entity: 'category',
    action: 'update',
    entityId: 'bulk-reorder',
    payload: { ids },
  })
}
