import { describe, it, expect, vi, beforeEach } from 'vitest'

import { outboxProcessor } from '@/shared/lib/local-storage/outbox-processor'

import {
  enqueueCreateTransaction,
  enqueueUpdateTransaction,
  enqueueDeleteTransaction,
} from '../outbox-helpers'
import type {
  CreateTransactionDto,
  UpdateTransactionDto,
} from '@/shared/api/generated/model'

const enqueueSpy = vi.spyOn(outboxProcessor, 'enqueue')

beforeEach(() => {
  enqueueSpy.mockClear()
  enqueueSpy.mockResolvedValue()
})

describe('transaction outbox helpers', () => {
  const createDto = {
    account: 'acc-1',
    category: 'cat-1',
    amount: 100,
    scale: 2,
    date: '2024-01-01',
    type: 'expense',
  } as unknown as CreateTransactionDto

  const updateDto = {
    amount: 200,
    scale: 2,
  } as unknown as UpdateTransactionDto

  it('enqueueCreateTransaction posts a create operation with the temp id', async () => {
    await enqueueCreateTransaction('temp-1', createDto)
    expect(enqueueSpy).toHaveBeenCalledWith({
      entity: 'transaction',
      action: 'create',
      entityId: 'temp-1',
      payload: createDto,
    })
  })

  it('enqueueUpdateTransaction packs data + params into payload', async () => {
    await enqueueUpdateTransaction('tx-1', updateDto, { recalcBalance: 'true' })
    expect(enqueueSpy).toHaveBeenCalledWith({
      entity: 'transaction',
      action: 'update',
      entityId: 'tx-1',
      payload: { data: updateDto, params: { recalcBalance: 'true' } },
    })
  })

  it('enqueueUpdateTransaction without params leaves params undefined', async () => {
    await enqueueUpdateTransaction('tx-1', updateDto)
    expect(enqueueSpy).toHaveBeenCalledWith({
      entity: 'transaction',
      action: 'update',
      entityId: 'tx-1',
      payload: { data: updateDto, params: undefined },
    })
  })

  it('enqueueDeleteTransaction posts a delete operation without payload', async () => {
    await enqueueDeleteTransaction('tx-1')
    expect(enqueueSpy).toHaveBeenCalledWith({
      entity: 'transaction',
      action: 'delete',
      entityId: 'tx-1',
    })
  })
})
