import { outboxProcessor } from '@/lib/local/outbox-processor'
import type { UpdateSettingsDto } from '../model/types'

/**
 * Enqueues a settings update operation for offline sync.
 * Settings is a singleton entity, so only update operations are supported.
 * The operation will be processed when connectivity is restored.
 * @param data - Partial settings data to update
 */
export async function enqueueUpdateSettings(
  data: UpdateSettingsDto
): Promise<void> {
  await outboxProcessor.enqueue({
    entity: 'settings',
    action: 'update',
    entityId: 'current', // Settings is a singleton
    payload: data,
  })
}
