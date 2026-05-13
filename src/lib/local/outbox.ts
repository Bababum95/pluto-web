export type OutboxStatus = 'pending' | 'processing' | 'failed' | 'done'

export type OutboxRow = {
  id: string
  entity: string
  action: 'create' | 'update' | 'delete'
  entityId: string
  payload?: unknown

  status: OutboxStatus
  attempts: number

  createdAt: string
  updatedAt: string
  lastError?: string
}
