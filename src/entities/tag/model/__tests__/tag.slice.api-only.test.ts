import { configureStore } from '@reduxjs/toolkit'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import tagReducer, {
  fetchTags,
  createTag,
  updateTag,
  deleteTag,
  setTags,
} from '../tag.slice'
import { tagApi } from '../api'
import type { TagDto } from '../types'

vi.mock('@/shared/lib/local-storage/config', () => ({
  LOCAL_DATA_MODE: 'api-only' as const,
  getLocalDataMode: (): 'dexie' | 'api-only' => 'api-only',
}))

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

describe('tag.slice (api-only mode)', () => {
  let store: TagTestStore

  beforeEach(() => {
    store = createTagTestStore()
    vi.clearAllMocks()
  })

  describe('fetchTags', () => {
    it('fetches tags from API', async () => {
      const mockTags: TagDto[] = [
        {
          id: '1',
          name: 'Tag 1',
          color: '#ff0000',
          icon: 'tag',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ]

      vi.mocked(tagApi.list).mockResolvedValue(mockTags)

      await store.dispatch(fetchTags())

      expect(tagApi.list).toHaveBeenCalled()
      expect(store.getState().tag.tags).toEqual(mockTags)
      expect(store.getState().tag.status).toBe('success')
    })

    it('sets status to pending while fetching', async () => {
      vi.mocked(tagApi.list).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      )

      const promise = store.dispatch(fetchTags())

      expect(store.getState().tag.status).toBe('pending')

      await promise
    })

    it('sets status to failed on error', async () => {
      vi.mocked(tagApi.list).mockRejectedValue(new Error('API error'))

      await store.dispatch(fetchTags())

      expect(store.getState().tag.status).toBe('failed')
    })
  })

  describe('createTag', () => {
    it('creates tag via API', async () => {
      const formData = { name: 'New Tag', color: '#ff0000', icon: 'tag' }
      const mockTag: TagDto = {
        id: '1',
        ...formData,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      }

      vi.mocked(tagApi.create).mockResolvedValue(mockTag)

      await store.dispatch(createTag(formData))

      expect(tagApi.create).toHaveBeenCalledWith(formData)
      expect(store.getState().tag.tags).toHaveLength(1)
      expect(store.getState().tag.tags[0]).toEqual(mockTag)
      expect(store.getState().tag.status).toBe('success')
    })

    it('sets status to pending while creating', async () => {
      vi.mocked(tagApi.create).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      )

      const promise = store.dispatch(createTag({ name: 'New Tag' }))

      expect(store.getState().tag.status).toBe('pending')

      await promise
    })

    it('does not add duplicate tag if it already exists', async () => {
      const formData = { name: 'New Tag', color: '#ff0000', icon: 'tag' }
      const mockTag: TagDto = {
        id: '1',
        ...formData,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      }

      store.dispatch(setTags([mockTag]))
      vi.mocked(tagApi.create).mockResolvedValue(mockTag)

      await store.dispatch(createTag(formData))

      expect(store.getState().tag.tags).toHaveLength(1)
    })

    it('sets status to failed on error', async () => {
      vi.mocked(tagApi.create).mockRejectedValue(new Error('API error'))

      await store.dispatch(createTag({ name: 'New Tag' }))

      expect(store.getState().tag.status).toBe('failed')
    })
  })

  describe('updateTag', () => {
    it('updates tag via API', async () => {
      const existingTag: TagDto = {
        id: '1',
        name: 'Tag 1',
        color: '#ff0000',
        icon: 'tag',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      }

      store.dispatch(setTags([existingTag]))

      const updateData = { name: 'Updated Tag', color: '#00ff00' }
      const updatedTag: TagDto = {
        ...existingTag,
        ...updateData,
        updatedAt: '2024-01-02T00:00:00Z',
      }

      vi.mocked(tagApi.update).mockResolvedValue(updatedTag)

      await store.dispatch(updateTag({ id: '1', data: updateData }))

      expect(tagApi.update).toHaveBeenCalledWith('1', updateData)
      expect(store.getState().tag.tags[0].name).toBe('Updated Tag')
      expect(store.getState().tag.tags[0].color).toBe('#00ff00')
    })

    it('does not update state when tag not found', async () => {
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
        id: '999',
        name: 'Updated Tag',
        color: '#00ff00',
        icon: 'tag',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      }

      vi.mocked(tagApi.update).mockResolvedValue(updatedTag)

      await store.dispatch(
        updateTag({ id: '999', data: { name: 'Updated Tag' } })
      )

      expect(store.getState().tag.tags).toHaveLength(1)
      expect(store.getState().tag.tags[0].id).toBe('1')
      expect(store.getState().tag.tags[0].name).toBe('Tag 1')
    })
  })

  describe('deleteTag', () => {
    it('deletes tag via API', async () => {
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

      vi.mocked(tagApi.delete).mockResolvedValue(undefined)

      await store.dispatch(deleteTag('1'))

      expect(tagApi.delete).toHaveBeenCalledWith('1')
      expect(store.getState().tag.tags).toHaveLength(1)
      expect(store.getState().tag.tags[0].id).toBe('2')
    })
  })
})
