import { configureStore } from '@reduxjs/toolkit'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import tagReducer, { setTags, addTag, removeTag } from '../tag.slice'
import type { TagDto } from '../types'

vi.mock('../api')
vi.mock('../../local/repository')
vi.mock('../../local/outbox-helpers')

function createTagTestStore() {
  return configureStore({
    reducer: {
      tag: tagReducer,
    },
  })
}

type TagTestStore = ReturnType<typeof createTagTestStore>

describe('tag.slice', () => {
  let store: TagTestStore

  beforeEach(() => {
    store = createTagTestStore()
    vi.clearAllMocks()
  })

  describe('reducers', () => {
    it('setTags replaces all tags', () => {
      const tags: TagDto[] = [
        {
          id: '1',
          name: 'Tag 1',
          color: '#ff0000',
          icon: 'tag',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ]

      store.dispatch(setTags(tags))

      expect(store.getState().tag.tags).toEqual(tags)
    })

    it('addTag adds new tag when it does not exist', () => {
      const tag: TagDto = {
        id: '1',
        name: 'Tag 1',
        color: '#ff0000',
        icon: 'tag',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      }

      store.dispatch(addTag(tag))

      expect(store.getState().tag.tags).toHaveLength(1)
      expect(store.getState().tag.tags[0]).toEqual(tag)
    })

    it('addTag updates existing tag when it exists', () => {
      const existingTag: TagDto = {
        id: '1',
        name: 'Tag 1',
        color: '#ff0000',
        icon: 'tag',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      }

      store.dispatch(setTags([existingTag]))

      const updatedTag: TagDto = {
        ...existingTag,
        name: 'Updated Tag',
        updatedAt: '2024-01-02T00:00:00Z',
      }

      store.dispatch(addTag(updatedTag))

      expect(store.getState().tag.tags).toHaveLength(1)
      expect(store.getState().tag.tags[0].name).toBe('Updated Tag')
    })

    it('removeTag removes tag by id', () => {
      const tags: TagDto[] = [
        {
          id: '1',
          name: 'Tag 1',
          color: '#ff0000',
          icon: 'tag',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          name: 'Tag 2',
          color: '#00ff00',
          icon: 'tag',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ]

      store.dispatch(setTags(tags))
      store.dispatch(removeTag('1'))

      expect(store.getState().tag.tags).toHaveLength(1)
      expect(store.getState().tag.tags[0].id).toBe('2')
    })
  })
})
