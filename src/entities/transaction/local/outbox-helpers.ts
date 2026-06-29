import { outboxProcessor } from '@/shared/lib/local-storage/outbox-processor'
import type {
  CreateTransactionDto,
  UpdateTransactionDto,
} from '@/shared/api/generated/model'

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
