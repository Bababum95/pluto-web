import { outboxProcessor } from '@/shared/lib/local-storage/outbox-processor'
import type {
  CreateAccountDto,
  UpdateAccountDto,
} from '@/entities/account/model/types'

const TEMP_ID_PREFIX = 'temp-'

export const isTempId = (id: string): boolean => id.startsWith(TEMP_ID_PREFIX)

export async function enqueueCreateAccount(
  tempId: string,
  data: CreateAccountDto
): Promise<void> {
  await outboxProcessor.enqueue({
    entity: 'account',
    action: 'create',
    entityId: tempId,
    payload: data,
  })
}

export async function enqueueUpdateAccount(
  id: string,
  data: UpdateAccountDto
): Promise<void> {
  await outboxProcessor.enqueue({
    entity: 'account',
    action: 'update',
    entityId: id,
    payload: data,
  })
}

export async function enqueueDeleteAccount(id: string): Promise<void> {
  await outboxProcessor.enqueue({
    entity: 'account',
    action: 'delete',
    entityId: id,
  })
}

export async function enqueueReorderAccounts(ids: string[]): Promise<void> {
  await outboxProcessor.enqueue({
    entity: 'account',
    action: 'update',
    entityId: 'bulk-reorder',
    payload: { ids },
  })
}

export async function enqueueToggleExcluded(id: string): Promise<void> {
  await outboxProcessor.enqueue({
    entity: 'account',
    action: 'update',
    entityId: id,
    payload: { toggleExcluded: true },
  })
}
