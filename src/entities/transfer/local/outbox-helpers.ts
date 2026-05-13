import { outboxProcessor } from '@/shared/lib/local-storage/outbox-processor'
import type {
  CreateTransferDto,
  UpdateTransferDto,
} from '@/shared/api/generated/model'

export async function enqueueCreateTransfer(
  tempId: string,
  data: CreateTransferDto
): Promise<void> {
  await outboxProcessor.enqueue({
    entity: 'transfer',
    action: 'create',
    entityId: tempId,
    payload: data,
  })
}

export async function enqueueUpdateTransfer(
  id: string,
  data: UpdateTransferDto
): Promise<void> {
  await outboxProcessor.enqueue({
    entity: 'transfer',
    action: 'update',
    entityId: id,
    payload: data,
  })
}

export async function enqueueDeleteTransfer(id: string): Promise<void> {
  await outboxProcessor.enqueue({
    entity: 'transfer',
    action: 'delete',
    entityId: id,
  })
}
