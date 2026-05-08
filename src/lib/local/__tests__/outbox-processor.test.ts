import { describe, it, expect, beforeEach, vi } from 'vitest'
import { OutboxProcessor } from '../outbox-processor'
import { db } from '../db'
import * as syncUtils from '../sync-utils'

// Mock calculateBackoff to avoid delays in tests
vi.spyOn(syncUtils, 'calculateBackoff').mockReturnValue(0)

describe('OutboxProcessor', () => {
  let processor: OutboxProcessor

  beforeEach(async () => {
    processor = new OutboxProcessor()
    await db.outbox.clear()
  })

  describe('enqueue', () => {
    it('should add operation to outbox with pending status', async () => {
      await processor.enqueue({
        entity: 'user',
        action: 'create',
        entityId: '1',
        payload: { id: '1', name: 'Test' },
      })

      const operations = await db.outbox.toArray()
      expect(operations).toHaveLength(1)
      expect(operations[0]).toMatchObject({
        entity: 'user',
        action: 'create',
        entityId: '1',
        status: 'pending',
        attempts: 0,
      })
      expect(operations[0].id).toBeDefined()
      expect(operations[0].createdAt).toBeDefined()
    })

    it('should generate unique IDs for multiple operations', async () => {
      await processor.enqueue({
        entity: 'user',
        action: 'create',
        entityId: '1',
        payload: { id: '1' },
      })
      await processor.enqueue({
        entity: 'user',
        action: 'update',
        entityId: '2',
        payload: { id: '2' },
      })

      const operations = await db.outbox.toArray()
      expect(operations).toHaveLength(2)
      expect(operations[0].id).not.toBe(operations[1].id)
    })
  })

  describe('processPending', () => {
    it('should process pending operations successfully', async () => {
      const mockHandler = vi.fn().mockResolvedValue(undefined)
      processor.registerHandler('user', mockHandler)

      await db.outbox.add({
        id: '1',
        entity: 'user',
        action: 'create',
        entityId: 'user-1',
        payload: { id: 'user-1', name: 'Test' },
        status: 'pending',
        attempts: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })

      const result = await processor.processPending()

      expect(result.processed).toBe(1)
      expect(result.succeeded).toBe(1)
      expect(result.failed).toBe(0)
      expect(mockHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          entity: 'user',
          action: 'create',
          entityId: 'user-1',
          payload: { id: 'user-1', name: 'Test' },
        })
      )

      const operation = await db.outbox.get('1')
      expect(operation?.status).toBe('done')
      expect(operation?.lastError).toBeUndefined()
    })

    it('should retry failed operations with exponential backoff', async () => {
      const mockHandler = vi
        .fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(undefined)

      processor.registerHandler('user', mockHandler)

      await db.outbox.add({
        id: '1',
        entity: 'user',
        action: 'create',
        entityId: 'user-1',
        payload: { id: 'user-1' },
        status: 'pending',
        attempts: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })

      // First attempt - should fail
      await processor.processPending()

      let operation = await db.outbox.get('1')
      expect(operation?.status).toBe('pending') // Status is 'pending' until MAX_ATTEMPTS
      expect(operation?.attempts).toBe(1)
      expect(operation?.lastError).toBe('Network error')

      // Second attempt - should succeed
      await processor.processPending()

      operation = await db.outbox.get('1')
      expect(operation?.status).toBe('done')
      expect(operation?.attempts).toBe(2)
    })

    it('should mark operation as failed after max attempts', async () => {
      const mockHandler = vi.fn().mockRejectedValue(new Error('Persistent error'))
      processor.registerHandler('user', mockHandler)

      await db.outbox.add({
        id: '1',
        entity: 'user',
        action: 'create',
        entityId: 'user-1',
        payload: { id: 'user-1' },
        status: 'pending',
        attempts: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })

      // Attempt 1
      await processor.processPending()
      let operation = await db.outbox.get('1')
      expect(operation?.attempts).toBe(1)
      expect(operation?.status).toBe('pending') // Status is 'pending' until MAX_ATTEMPTS

      // Attempt 2
      await processor.processPending()
      operation = await db.outbox.get('1')
      expect(operation?.attempts).toBe(2)
      expect(operation?.status).toBe('pending') // Still 'pending'

      // Attempt 3 (max)
      await processor.processPending()
      operation = await db.outbox.get('1')
      expect(operation?.attempts).toBe(3)
      expect(operation?.status).toBe('failed') // Now 'failed' after MAX_ATTEMPTS
      expect(operation?.lastError).toBe('Persistent error')

      // Should not process again
      mockHandler.mockClear()
      await processor.processPending()
      expect(mockHandler).not.toHaveBeenCalled()
    })

    it('should skip operations without registered handler', async () => {
      await db.outbox.add({
        id: '1',
        entity: 'unknown',
        action: 'create',
        entityId: 'user-1',
        payload: {},
        status: 'pending',
        attempts: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })

      const result = await processor.processPending()

      expect(result.processed).toBe(1)
      expect(result.failed).toBe(1)

      const operation = await db.outbox.get('1')
      // Operation status remains unchanged when no handler
      expect(operation?.status).toBe('pending')
    })

    it('should process multiple operations in order', async () => {
      const mockHandler = vi.fn().mockResolvedValue(undefined)
      processor.registerHandler('user', mockHandler)

      const now = new Date()
      await db.outbox.bulkAdd([
        {
          id: '1',
          entity: 'user',
          action: 'create',
          entityId: 'user-1',
          payload: { id: 'user-1' },
          status: 'pending',
          attempts: 0,
          createdAt: new Date(now.getTime() - 2000).toISOString(),
          updatedAt: new Date(now.getTime() - 2000).toISOString(),
        },
        {
          id: '2',
          entity: 'user',
          action: 'update',
          entityId: 'user-2',
          payload: { id: 'user-2' },
          status: 'pending',
          attempts: 0,
          createdAt: new Date(now.getTime() - 1000).toISOString(),
          updatedAt: new Date(now.getTime() - 1000).toISOString(),
        },
      ])

      const result = await processor.processPending()

      expect(result.processed).toBe(2)
      expect(result.succeeded).toBe(2)
      expect(mockHandler).toHaveBeenCalledTimes(2)
      // Should process in chronological order (oldest first)
      expect(mockHandler.mock.calls[0][0]).toMatchObject({
        entity: 'user',
        action: 'create',
        entityId: 'user-1',
        payload: { id: 'user-1' },
      })
      expect(mockHandler.mock.calls[1][0]).toMatchObject({
        entity: 'user',
        action: 'update',
        entityId: 'user-2',
        payload: { id: 'user-2' },
      })
    })
  })

  describe('processEntity', () => {
    it('should process only operations for specified entity', async () => {
      const userHandler = vi.fn().mockResolvedValue(undefined)
      const categoryHandler = vi.fn().mockResolvedValue(undefined)

      processor.registerHandler('user', userHandler)
      processor.registerHandler('category', categoryHandler)

      await db.outbox.bulkAdd([
        {
          id: '1',
          entity: 'user',
          action: 'create',
          entityId: 'user-1',
          payload: { id: 'user-1' },
          status: 'pending',
          attempts: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          entity: 'category',
          action: 'create',
          entityId: 'user-1',
          payload: { id: 'cat-1' },
          status: 'pending',
          attempts: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ])

      const result = await processor.processEntity('user')

      expect(result.processed).toBe(1)
      expect(userHandler).toHaveBeenCalledTimes(1)
      expect(categoryHandler).not.toHaveBeenCalled()

      const userOp = await db.outbox.get('1')
      const categoryOp = await db.outbox.get('2')
      expect(userOp?.status).toBe('done')
      expect(categoryOp?.status).toBe('pending')
    })
  })

  describe('cleanup', () => {
    it('should remove completed operations older than specified days', async () => {
      const now = new Date()
      const eightDaysAgo = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000)
      const sixDaysAgo = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000)

      await db.outbox.bulkAdd([
        {
          id: '1',
          entity: 'user',
          action: 'create',
        entityId: 'user-1',
          payload: {},
          status: 'done',
          attempts: 1,
          createdAt: eightDaysAgo.toISOString(),
          updatedAt: eightDaysAgo.toISOString(),
        },
        {
          id: '2',
          entity: 'user',
          action: 'update',
          entityId: 'user-2',
          payload: {},
          status: 'done',
          attempts: 1,
          createdAt: sixDaysAgo.toISOString(),
          updatedAt: sixDaysAgo.toISOString(),
        },
        {
          id: '3',
          entity: 'user',
          action: 'delete',
          entityId: 'user-3',
          payload: {},
          status: 'pending',
          attempts: 0,
          createdAt: eightDaysAgo.toISOString(),
          updatedAt: eightDaysAgo.toISOString(),
        },
      ])

      await processor.cleanup(7)

      const remaining = await db.outbox.toArray()
      expect(remaining).toHaveLength(2)
      expect(remaining.find((op) => op.id === '1')).toBeUndefined()
      expect(remaining.find((op) => op.id === '2')).toBeDefined()
      expect(remaining.find((op) => op.id === '3')).toBeDefined()
    })

    it('should not remove pending or failed operations', async () => {
      const oldDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()

      await db.outbox.bulkAdd([
        {
          id: '1',
          entity: 'user',
          action: 'create',
        entityId: 'user-1',
          payload: {},
          status: 'pending',
          attempts: 0,
          createdAt: oldDate,
          updatedAt: oldDate,
        },
        {
          id: '2',
          entity: 'user',
          action: 'update',
          entityId: 'user-2',
          payload: {},
          status: 'failed',
          attempts: 3,
          createdAt: oldDate,
          updatedAt: oldDate,
        },
      ])

      await processor.cleanup(7)

      const remaining = await db.outbox.toArray()
      expect(remaining).toHaveLength(2)
    })
  })

  describe('registerHandler', () => {
    it('should allow registering multiple handlers for different entities', () => {
      const userHandler = vi.fn()
      const categoryHandler = vi.fn()

      processor.registerHandler('user', userHandler)
      processor.registerHandler('category', categoryHandler)

      // No error should be thrown
      expect(true).toBe(true)
    })

    it('should overwrite existing handler for same entity', async () => {
      const handler1 = vi.fn().mockResolvedValue(undefined)
      const handler2 = vi.fn().mockResolvedValue(undefined)

      processor.registerHandler('user', handler1)
      processor.registerHandler('user', handler2)

      await db.outbox.add({
        id: '1',
        entity: 'user',
        action: 'create',
        entityId: 'user-1',
        payload: {},
        status: 'pending',
        attempts: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })

      await processor.processPending()

      expect(handler1).not.toHaveBeenCalled()
      expect(handler2).toHaveBeenCalledTimes(1)
    })
  })
})
