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
import { tagRepository } from '../../local/repository'
import {
  enqueueCreateTag,
  enqueueUpdateTag,
  enqueueDeleteTag,
} from '../../local/outbox-helpers'
import type { TagDto } from '../types'
import { generateTempEntityId } from '@/shared/lib/local-storage/temp-id'

vi.mock('@/shared/lib/local-storage/temp-id', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/shared/lib/local-storage/temp-id')>()
  return {
    ...actual,
    generateTempEntityId: vi.fn(actual.generateTempEntityId),
  }
})

vi.mock('@/shared/lib/local-storage/config', () => ({
  LOCAL_DATA_MODE: 'dexie' as const,
  getLocalDataMode: (): 'dexie' | 'api-only' => 'dexie',
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

describe('tag.slice (dexie mode)', () => {
  let store: TagTestStore

  beforeEach(() => {
    store = createTagTestStore()
    vi.clearAllMocks()
    vi.mocked(generateTempEntityId).mockImplementation(
      () => `temp-${crypto.randomUUID()}`
    )
  })

  describe('fetchTags', () => {
    it('fetches tags from local storage when available', async () => {
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

      vi.mocked(tagRepository.getAll).mockResolvedValue(mockTags)

      await store.dispatch(fetchTags())

      expect(tagRepository.getAll).toHaveBeenCalled()
      expect(tagApi.list).not.toHaveBeenCalled()
      expect(store.getState().tag.tags).toEqual(mockTags)
      expect(store.getState().tag.status).toBe('success')
    })

    it('fetches from API and saves to local storage when local is empty', async () => {
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

      vi.mocked(tagRepository.getAll).mockResolvedValue([])
      vi.mocked(tagApi.list).mockResolvedValue(mockTags)

      await store.dispatch(fetchTags())

      expect(tagRepository.getAll).toHaveBeenCalled()
      expect(tagApi.list).toHaveBeenCalled()
      expect(tagRepository.saveMany).toHaveBeenCalledWith(mockTags)
      expect(store.getState().tag.tags).toEqual(mockTags)
    })

    it('sets status to pending while fetching', async () => {
      vi.mocked(tagRepository.getAll).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      )

      const promise = store.dispatch(fetchTags())

      expect(store.getState().tag.status).toBe('pending')

      await promise
    })

    it('sets status to failed on error', async () => {
      vi.mocked(tagRepository.getAll).mockRejectedValue(new Error('DB error'))

      await store.dispatch(fetchTags())

      expect(store.getState().tag.status).toBe('failed')
    })
  })

  describe('createTag', () => {
    it('creates tag locally with temp ID', async () => {
      const formData = { name: 'New Tag', color: '#ff0000', icon: 'tag' }

      await store.dispatch(createTag(formData))

      expect(tagRepository.save).toHaveBeenCalled()
      expect(enqueueCreateTag).toHaveBeenCalled()
      expect(store.getState().tag.tags).toHaveLength(1)
      expect(store.getState().tag.tags[0].id).toMatch(/^temp-/)
      expect(store.getState().tag.tags[0].name).toBe('New Tag')
      expect(store.getState().tag.tags[0].color).toBe('#ff0000')
      expect(store.getState().tag.status).toBe('success')
    })

    it('handles missing optional fields', async () => {
      const formData = { name: 'New Tag' }

      await store.dispatch(createTag(formData))

      expect(store.getState().tag.tags[0].color).toBe('')
      expect(store.getState().tag.tags[0].icon).toBe('')
    })

    it('sets status to pending while creating', async () => {
      vi.mocked(tagRepository.save).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      )

      const promise = store.dispatch(createTag({ name: 'New Tag' }))

      expect(store.getState().tag.status).toBe('pending')

      await promise
    })

    it('does not add duplicate tag if it already exists', async () => {
      const formData = { name: 'New Tag', color: '#ff0000', icon: 'tag' }

      vi.mocked(generateTempEntityId).mockReturnValue('temp-1')

      await store.dispatch(createTag(formData))
      const firstTag = store.getState().tag.tags[0]

      vi.mocked(tagRepository.save).mockResolvedValue()
      vi.mocked(enqueueCreateTag).mockResolvedValue()

      await store.dispatch(createTag(formData))

      expect(store.getState().tag.tags).toHaveLength(1)
      expect(store.getState().tag.tags[0]).toEqual(firstTag)
    })

    it('sets status to failed on error', async () => {
      vi.mocked(tagRepository.save).mockRejectedValue(new Error('DB error'))

      await store.dispatch(createTag({ name: 'New Tag' }))

      expect(store.getState().tag.status).toBe('failed')
    })
  })

  describe('updateTag', () => {
    it('updates tag locally', async () => {
      const existingTag: TagDto = {
        id: '1',
        name: 'Tag 1',
        color: '#ff0000',
        icon: 'tag',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      }

      store.dispatch(setTags([existingTag]))
      vi.mocked(tagRepository.getById).mockResolvedValue(existingTag)
      vi.mocked(tagRepository.save).mockResolvedValue()
      vi.mocked(enqueueUpdateTag).mockResolvedValue()

      const updateData = { name: 'Updated Tag', color: '#00ff00' }

      const result = await store.dispatch(
        updateTag({ id: '1', data: updateData })
      )

      expect(result.type).toBe('tag/updateTag/fulfilled')
      expect(tagRepository.getById).toHaveBeenCalledWith('1')
      expect(tagRepository.save).toHaveBeenCalled()
      expect(enqueueUpdateTag).toHaveBeenCalledWith('1', updateData)

      const savedTag = vi.mocked(tagRepository.save).mock.calls[0][0]
      expect(savedTag.name).toBe('Updated Tag')
      expect(savedTag.color).toBe('#00ff00')

      // Check Redux state was updated
      expect(store.getState().tag.tags[0].name).toBe('Updated Tag')
      expect(store.getState().tag.tags[0].color).toBe('#00ff00')
    })

    it('rejects when tag not found', async () => {
      vi.mocked(tagRepository.getById).mockResolvedValue(null)

      const result = await store.dispatch(
        updateTag({ id: '1', data: { name: 'Updated' } })
      )

      if (updateTag.rejected.match(result)) {
        expect(result.error.message).toBe('Tag 1 not found')
      } else {
        expect.fail(`expected rejected, got ${result.type}`)
      }
    })

    it('updates updatedAt timestamp', async () => {
      const existingTag: TagDto = {
        id: '1',
        name: 'Tag 1',
        color: '#ff0000',
        icon: 'tag',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      }

      vi.mocked(tagRepository.getById).mockResolvedValue(existingTag)

      await store.dispatch(updateTag({ id: '1', data: { name: 'Updated' } }))

      const savedTag = vi.mocked(tagRepository.save).mock.calls[0][0]
      expect(savedTag.updatedAt).not.toBe(existingTag.updatedAt)
      expect(new Date(savedTag.updatedAt).getTime()).toBeGreaterThan(
        new Date(existingTag.updatedAt).getTime()
      )
    })
  })

  describe('deleteTag', () => {
    it('deletes tag locally', async () => {
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

      await store.dispatch(deleteTag('1'))

      expect(tagRepository.delete).toHaveBeenCalledWith('1')
      expect(enqueueDeleteTag).toHaveBeenCalledWith('1')
      expect(store.getState().tag.tags).toHaveLength(1)
      expect(store.getState().tag.tags[0].id).toBe('2')
    })
  })
})
