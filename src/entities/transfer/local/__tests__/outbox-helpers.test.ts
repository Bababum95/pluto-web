import { describe, it, expect, vi, beforeEach } from 'vitest'

import { outboxProcessor } from '@/shared/lib/local-storage/outbox-processor'

import {
  enqueueCreateTransfer,
  enqueueUpdateTransfer,
  enqueueDeleteTransfer,
} from '../outbox-helpers'
import type {
  CreateTransferDto,
  UpdateTransferDto,
} from '@/shared/api/generated/model'

const enqueueSpy = vi.spyOn(outboxProcessor, 'enqueue')

beforeEach(() => {
  enqueueSpy.mockClear()
  enqueueSpy.mockResolvedValue()
})

const createDto = {
  from: { account: 'a', value: 100, scale: 2 },
  to: { account: 'b', value: 90, scale: 2 },
  rate: 1.1,
} as unknown as CreateTransferDto

const updateDto = {
  rate: 0.5,
} as unknown as UpdateTransferDto

describe('transfer outbox helpers', () => {
  it('enqueueCreateTransfer posts a create operation with the temp id', async () => {
    await enqueueCreateTransfer('temp-1', createDto)
    expect(enqueueSpy).toHaveBeenCalledWith({
      entity: 'transfer',
      action: 'create',
      entityId: 'temp-1',
      payload: createDto,
    })
  })

  it('enqueueUpdateTransfer posts an update operation with the payload', async () => {
    await enqueueUpdateTransfer('tr-1', updateDto)
    expect(enqueueSpy).toHaveBeenCalledWith({
      entity: 'transfer',
      action: 'update',
      entityId: 'tr-1',
      payload: updateDto,
    })
  })

  it('enqueueDeleteTransfer posts a delete operation without payload', async () => {
    await enqueueDeleteTransfer('tr-1')
    expect(enqueueSpy).toHaveBeenCalledWith({
      entity: 'transfer',
      action: 'delete',
      entityId: 'tr-1',
    })
  })
})
