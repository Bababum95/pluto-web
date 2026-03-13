import { describe, it, expect, vi } from 'vitest'

vi.mock('@/store', () => ({
  createStore: vi.fn(() => ({ getState: vi.fn(() => ({})) })),
}))

import tagReducer, {
  fetchTags,
  createTag,
  updateTag,
  deleteTag,
  setTags,
  addTag,
  removeTag,
} from './index'
import { mockTag, createMockTag } from '@/testing/data/tag'

const tag2 = createMockTag({
  id: 'tag-2',
  name: 'work',
})

describe('tag slice', () => {
  describe('reducers', () => {
    it('setTags replaces list', () => {
      const state = tagReducer(undefined, setTags([mockTag, tag2]))
      expect(state.tags).toHaveLength(2)
      expect(state.tags[0].id).toBe(mockTag.id)
      expect(state.tags[1].id).toBe('tag-2')
    })

    it('addTag appends tag', () => {
      let state = tagReducer(undefined, setTags([mockTag]))
      state = tagReducer(state, addTag(tag2))
      expect(state.tags).toHaveLength(2)
      expect(state.tags[1].name).toBe('work')
    })

    it('removeTag removes by id', () => {
      let state = tagReducer(undefined, setTags([mockTag, tag2]))
      state = tagReducer(state, removeTag(mockTag.id))
      expect(state.tags).toHaveLength(1)
      expect(state.tags[0].id).toBe('tag-2')
    })
  })

  describe('fetchTags', () => {
    it('pending sets status to pending', () => {
      const state = tagReducer(undefined, fetchTags.pending('req-1', undefined))
      expect(state.status).toBe('pending')
    })

    it('fulfilled sets tags', () => {
      const list = [mockTag, tag2]
      const action = fetchTags.fulfilled(list, 'req-1', undefined)
      const state = tagReducer(undefined, action)
      expect(state.status).toBe('success')
      expect(state.tags).toEqual(list)
    })

    it('rejected sets status to failed', () => {
      const state = tagReducer(
        undefined,
        fetchTags.rejected(new Error('fail'), 'req-1', undefined)
      )
      expect(state.status).toBe('failed')
    })
  })

  describe('createTag', () => {
    it('pending sets status to pending', () => {
      const state = tagReducer(
        undefined,
        createTag.pending('req-1', {} as never)
      )
      expect(state.status).toBe('pending')
    })

    it('fulfilled appends tag', () => {
      const newTag = createMockTag({ id: 'tag-new', name: 'travel' })
      let state = tagReducer(undefined, setTags([mockTag]))
      const action = createTag.fulfilled(newTag, 'req-1', {} as never)
      state = tagReducer(state, action)
      expect(state.status).toBe('success')
      expect(state.tags).toHaveLength(2)
      expect(state.tags[1]).toEqual(newTag)
    })

    it('rejected sets status to failed', () => {
      const state = tagReducer(
        undefined,
        createTag.rejected(new Error('fail'), 'req-1', {} as never)
      )
      expect(state.status).toBe('failed')
    })
  })

  describe('updateTag', () => {
    it('fulfilled updates tag in list by id', () => {
      const updated = createMockTag({
        id: mockTag.id,
        name: 'Updated Tag',
      })
      let state = tagReducer(
        undefined,
        fetchTags.fulfilled([mockTag, tag2], 'req-1', undefined)
      )
      const action = updateTag.fulfilled(updated, 'req-1', {
        id: mockTag.id,
        data: {} as never,
      })
      state = tagReducer(state, action)
      expect(state.tags[0].name).toBe('Updated Tag')
      expect(state.tags[1]).toEqual(tag2)
    })
  })

  describe('deleteTag', () => {
    it('fulfilled removes tag by meta.arg', () => {
      let state = tagReducer(
        undefined,
        fetchTags.fulfilled([mockTag, tag2], 'req-1', undefined)
      )
      const action = deleteTag.fulfilled(undefined, 'req-1', mockTag.id)
      state = tagReducer(state, action)
      expect(state.tags).toHaveLength(1)
      expect(state.tags[0].id).toBe('tag-2')
    })
  })
})
