import { describe, it, expect, vi, beforeEach } from 'vitest'

import { outboxProcessor } from '@/lib/local/outbox-processor'

import {
  enqueueCreateTag,
  enqueueUpdateTag,
  enqueueDeleteTag,
} from '../outbox-helpers'
import type { CreateTagDto, UpdateTagDto } from '../../model/types'

const enqueueSpy = vi.spyOn(outboxProcessor, 'enqueue')

beforeEach(() => {
  enqueueSpy.mockClear()
  enqueueSpy.mockResolvedValue()
})

const createDto = { name: 'Lunch' } as unknown as CreateTagDto
const updateDto = { name: 'Renamed' } as unknown as UpdateTagDto

describe('tag outbox helpers', () => {
  it('enqueueCreateTag rejects when temp id is missing the temp- prefix', async () => {
    await expect(enqueueCreateTag('tag-1', createDto)).rejects.toThrow(
      /temp- prefix/
    )
    expect(enqueueSpy).not.toHaveBeenCalled()
  })

  it('enqueueCreateTag posts a create operation when prefix is valid', async () => {
    await enqueueCreateTag('temp-1', createDto)
    expect(enqueueSpy).toHaveBeenCalledWith({
      entity: 'tag',
      action: 'create',
      entityId: 'temp-1',
      payload: createDto,
    })
  })

  it('enqueueUpdateTag rejects when id is empty', async () => {
    await expect(enqueueUpdateTag('', updateDto)).rejects.toThrow(
      /valid tag ID/
    )
    await expect(enqueueUpdateTag('   ', updateDto)).rejects.toThrow(
      /valid tag ID/
    )
    expect(enqueueSpy).not.toHaveBeenCalled()
  })

  it('enqueueUpdateTag posts an update operation with the payload', async () => {
    await enqueueUpdateTag('tag-1', updateDto)
    expect(enqueueSpy).toHaveBeenCalledWith({
      entity: 'tag',
      action: 'update',
      entityId: 'tag-1',
      payload: updateDto,
    })
  })

  it('enqueueDeleteTag rejects when id is empty', async () => {
    await expect(enqueueDeleteTag('')).rejects.toThrow(/valid tag ID/)
    await expect(enqueueDeleteTag('   ')).rejects.toThrow(/valid tag ID/)
    expect(enqueueSpy).not.toHaveBeenCalled()
  })

  it('enqueueDeleteTag posts a delete operation without payload', async () => {
    await enqueueDeleteTag('tag-1')
    expect(enqueueSpy).toHaveBeenCalledWith({
      entity: 'tag',
      action: 'delete',
      entityId: 'tag-1',
    })
  })
})
