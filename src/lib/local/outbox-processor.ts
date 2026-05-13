import { db } from './db'
import type { OutboxRow } from './outbox'
import { calculateBackoff } from './sync-utils'

const MAX_ATTEMPTS = 3

export type ProcessResult = {
  processed: number
  succeeded: number
  failed: number
}

export type OutboxOperation = Omit<
  OutboxRow,
  'id' | 'status' | 'attempts' | 'createdAt' | 'updatedAt'
>

type ApiHandler = (operation: OutboxRow) => Promise<void>

const apiHandlers = new Map<string, ApiHandler>()

export class OutboxProcessor {
  registerHandler(entity: string, handler: ApiHandler): void {
    apiHandlers.set(entity, handler)
  }

  async processPending(): Promise<ProcessResult> {
    const pending = await db.outbox
      .where('status')
      .anyOf(['pending', 'failed'])
      .sortBy('createdAt')

    let succeeded = 0
    let failed = 0

    for (const operation of pending) {
      const success = await this.processOperation(operation)
      if (success) {
        succeeded++
      } else {
        failed++
      }
    }

    return {
      processed: pending.length,
      succeeded,
      failed,
    }
  }

  async processEntity(entity: string): Promise<ProcessResult> {
    const pending = await db.outbox
      .where('entity')
      .equals(entity)
      .and((op) => op.status === 'pending' || op.status === 'failed')
      .sortBy('createdAt')

    let succeeded = 0
    let failed = 0

    for (const operation of pending) {
      const success = await this.processOperation(operation)
      if (success) {
        succeeded++
      } else {
        failed++
      }
    }

    return {
      processed: pending.length,
      succeeded,
      failed,
    }
  }

  private async processOperation(operation: OutboxRow): Promise<boolean> {
    const handler = apiHandlers.get(operation.entity)

    if (!handler) {
      console.warn(`No handler registered for entity: ${operation.entity}`)
      return false
    }

    if (operation.attempts >= MAX_ATTEMPTS) {
      return false
    }

    await db.outbox.update(operation.id, {
      status: 'processing',
      updatedAt: new Date().toISOString(),
    })

    try {
      await handler(operation)

      await db.outbox.update(operation.id, {
        status: 'done',
        attempts: operation.attempts + 1,
        updatedAt: new Date().toISOString(),
        lastError: undefined,
      })

      return true
    } catch (error) {
      const attempts = operation.attempts + 1
      const lastError = error instanceof Error ? error.message : 'Unknown error'

      await db.outbox.update(operation.id, {
        status: attempts >= MAX_ATTEMPTS ? 'failed' : 'pending',
        attempts,
        lastError,
        updatedAt: new Date().toISOString(),
      })

      if (attempts < MAX_ATTEMPTS) {
        const delay = calculateBackoff(attempts)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }

      return false
    }
  }

  async enqueue(operation: OutboxOperation): Promise<void> {
    const now = new Date().toISOString()

    await db.outbox.add({
      id: crypto.randomUUID(),
      ...operation,
      status: 'pending',
      attempts: 0,
      createdAt: now,
      updatedAt: now,
    })
  }

  async cleanup(olderThanDays: number = 7): Promise<void> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays)
    const cutoff = cutoffDate.toISOString()

    const toDelete = await db.outbox
      .where('status')
      .equals('done')
      .and((op) => op.updatedAt < cutoff)
      .primaryKeys()

    await db.outbox.bulkDelete(toDelete)
  }
}

export const outboxProcessor = new OutboxProcessor()
