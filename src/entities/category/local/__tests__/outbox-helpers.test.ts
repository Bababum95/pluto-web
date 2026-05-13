import { describe, it, expect, vi, beforeEach } from 'vitest'

import { outboxProcessor } from '@/lib/local/outbox-processor'

import {
  enqueueCreateCategory,
  enqueueUpdateCategory,
  enqueueDeleteCategory,
  enqueueReorderCategories,
  isTempId,
} from '../outbox-helpers'
import type { CreateCategoryDto, UpdateCategoryDto } from '../../model/types'

const enqueueSpy = vi.spyOn(outboxProcessor, 'enqueue')

beforeEach(() => {
  enqueueSpy.mockClear()
  enqueueSpy.mockResolvedValue()
})

const createDto = {
  name: 'Food',
  color: '#fff',
} as unknown as CreateCategoryDto
const updateDto = { name: 'Groceries' } as unknown as UpdateCategoryDto

describe('isTempId', () => {
  it('returns true for ids with temp- prefix', () => {
    expect(isTempId('temp-1')).toBe(true)
  })

  it('returns false for real ids', () => {
    expect(isTempId('cat-1')).toBe(false)
  })
})

describe('category outbox helpers', () => {
  it('enqueueCreateCategory posts a create operation with the temp id', async () => {
    await enqueueCreateCategory('temp-1', createDto)
    expect(enqueueSpy).toHaveBeenCalledWith({
      entity: 'category',
      action: 'create',
      entityId: 'temp-1',
      payload: createDto,
    })
  })

  it('enqueueUpdateCategory posts an update operation with the payload', async () => {
    await enqueueUpdateCategory('cat-1', updateDto)
    expect(enqueueSpy).toHaveBeenCalledWith({
      entity: 'category',
      action: 'update',
      entityId: 'cat-1',
      payload: updateDto,
    })
  })

  it('enqueueDeleteCategory posts a delete operation without payload', async () => {
    await enqueueDeleteCategory('cat-1')
    expect(enqueueSpy).toHaveBeenCalledWith({
      entity: 'category',
      action: 'delete',
      entityId: 'cat-1',
    })
  })

  it('enqueueReorderCategories uses the bulk-reorder pseudo id', async () => {
    await enqueueReorderCategories(['a', 'b', 'c'])
    expect(enqueueSpy).toHaveBeenCalledWith({
      entity: 'category',
      action: 'update',
      entityId: 'bulk-reorder',
      payload: { ids: ['a', 'b', 'c'] },
    })
  })
})
