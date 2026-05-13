import { outboxProcessor } from '@/lib/local/outbox-processor'
import type {
  CreateTransactionDto,
  UpdateTransactionDto,
} from '@/lib/api/generated/model'

const TEMP_PREFIX = 'temp-'

export function isTempTransactionId(id: string): boolean {
  return id.startsWith(TEMP_PREFIX)
}

export async function enqueueCreateTransaction(
  tempId: string,
  data: CreateTransactionDto
): Promise<void> {
  await outboxProcessor.enqueue({
    entity: 'transaction',
    action: 'create',
    entityId: tempId,
    payload: data,
  })
}

export async function enqueueUpdateTransaction(
  id: string,
  data: UpdateTransactionDto,
  params?: Record<string, string>
): Promise<void> {
  await outboxProcessor.enqueue({
    entity: 'transaction',
    action: 'update',
    entityId: id,
    payload: { data, params },
  })
}

export async function enqueueDeleteTransaction(id: string): Promise<void> {
  await outboxProcessor.enqueue({
    entity: 'transaction',
    action: 'delete',
    entityId: id,
  })
}
