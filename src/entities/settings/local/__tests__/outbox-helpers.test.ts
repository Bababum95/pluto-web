import { describe, it, expect, vi, beforeEach } from 'vitest'

import { outboxProcessor } from '@/shared/lib/local-storage/outbox-processor'

import { enqueueUpdateSettings } from '../outbox-helpers'
import type { UpdateSettingsDto } from '../../model/types'

const enqueueSpy = vi.spyOn(outboxProcessor, 'enqueue')

beforeEach(() => {
  enqueueSpy.mockClear()
  enqueueSpy.mockResolvedValue()
})

describe('settings outbox helpers', () => {
  it('enqueueUpdateSettings posts an update operation on the singleton id', async () => {
    const dto = { currency: 'USD' } as unknown as UpdateSettingsDto

    await enqueueUpdateSettings(dto)

    expect(enqueueSpy).toHaveBeenCalledWith({
      entity: 'settings',
      action: 'update',
      entityId: 'current',
      payload: dto,
    })
  })
})
