import { outboxProcessor } from '@/lib/local/outbox-processor'
import type { CreateTagDto, UpdateTagDto } from '../model/types'

/**
 * Enqueues a tag creation operation for offline sync.
 * The operation will be processed when connectivity is restored.
 * @param tempId - Temporary ID with 'temp-' prefix for optimistic UI updates
 * @param data - Tag creation data
 */
export async function enqueueCreateTag(
  tempId: string,
  data: CreateTagDto
): Promise<void> {
  if (!tempId.startsWith('temp-')) {
    throw new Error('Create operation requires temporary ID with temp- prefix')
  }

  await outboxProcessor.enqueue({
    entity: 'tag',
    action: 'create',
    entityId: tempId,
    payload: data,
  })
}

/**
 * Enqueues a tag update operation for offline sync.
 * The operation will be processed when connectivity is restored.
 * @param id - Tag ID to update
 * @param data - Partial tag data to update
 */
export async function enqueueUpdateTag(
  id: string,
  data: UpdateTagDto
): Promise<void> {
  if (!id || id.trim() === '') {
    throw new Error('Update operation requires valid tag ID')
  }

  await outboxProcessor.enqueue({
    entity: 'tag',
    action: 'update',
    entityId: id,
    payload: data,
  })
}

/**
 * Enqueues a tag deletion operation for offline sync.
 * The operation will be processed when connectivity is restored.
 * @param id - Tag ID to delete
 */
export async function enqueueDeleteTag(id: string): Promise<void> {
  if (!id || id.trim() === '') {
    throw new Error('Delete operation requires valid tag ID')
  }

  await outboxProcessor.enqueue({
    entity: 'tag',
    action: 'delete',
    entityId: id,
  })
}
