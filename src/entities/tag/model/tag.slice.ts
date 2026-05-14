import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from '@reduxjs/toolkit'

import { tagApi } from './api'
import { tagRepository } from '../local/repository'
import {
  enqueueCreateTag,
  enqueueUpdateTag,
  enqueueDeleteTag,
} from '../local/outbox-helpers'
import { LOCAL_DATA_MODE } from '@/shared/lib/local-storage/config'
import { generateTempEntityId } from '@/shared/lib/local-storage/temp-id'
import type { TagDto, TagFormValues } from './types'
import type { Status } from '@/shared/lib/async-status'

type TagState = {
  tags: TagDto[]
  status: Status
}

const initialState: TagState = {
  tags: [],
  status: 'idle',
}

/**
 * Fetch tags from local storage (if available) or API.
 * In dexie mode: load from IndexedDB first, fallback to API.
 * In api-only mode: fetch directly from API.
 */
export const fetchTags = createAsyncThunk('tag/fetchTags', async () => {
  if (LOCAL_DATA_MODE === 'dexie') {
    const localTags = await tagRepository.getAll()

    if (localTags.length > 0) {
      return localTags
    }

    const apiTags = await tagApi.list()
    await tagRepository.saveMany(apiTags)
    return apiTags
  }

  return tagApi.list()
})

/**
 * Create a new tag.
 * In dexie mode: save locally with temp ID, enqueue for sync.
 * In api-only mode: create via API directly.
 */
export const createTag = createAsyncThunk(
  'tag/createTag',
  async (data: TagFormValues) => {
    if (LOCAL_DATA_MODE === 'dexie') {
      const tempId = generateTempEntityId()
      const now = new Date().toISOString()
      const tempTag: TagDto = {
        id: tempId,
        name: data.name,
        color: data.color || '',
        icon: data.icon || '',
        createdAt: now,
        updatedAt: now,
      }

      await tagRepository.save(tempTag)
      await enqueueCreateTag(tempId, data)

      return tempTag
    }

    return tagApi.create(data)
  }
)

/**
 * Update an existing tag.
 * In dexie mode: update locally, enqueue for sync.
 * In api-only mode: update via API directly.
 */
export const updateTag = createAsyncThunk(
  'tag/updateTag',
  async ({ id, data }: { id: string; data: TagFormValues }) => {
    if (LOCAL_DATA_MODE === 'dexie') {
      const existing = await tagRepository.getById(id)
      if (!existing) throw new Error(`Tag ${id} not found`)

      const updated: TagDto = {
        ...existing,
        ...data,
        updatedAt: new Date().toISOString(),
      }

      await tagRepository.save(updated)
      await enqueueUpdateTag(id, data)

      return updated
    }

    return tagApi.update(id, data)
  }
)

/**
 * Delete a tag.
 * In dexie mode: delete locally, enqueue for sync.
 * In api-only mode: delete via API directly.
 */
export const deleteTag = createAsyncThunk(
  'tag/deleteTag',
  async (id: string) => {
    if (LOCAL_DATA_MODE === 'dexie') {
      await tagRepository.delete(id)
      await enqueueDeleteTag(id)
      return id
    }

    await tagApi.delete(id)
    return id
  }
)

export const tagSlice = createSlice({
  name: 'tag',
  initialState,
  reducers: {
    setTags: (state, action: PayloadAction<TagDto[]>) => {
      state.tags = action.payload
    },
    addTag: (state, action: PayloadAction<TagDto>) => {
      const exists = state.tags.find((t) => t.id === action.payload.id)
      if (exists) {
        Object.assign(exists, action.payload)
      } else {
        state.tags.push(action.payload)
      }
    },
    removeTag: (state, action: PayloadAction<string>) => {
      state.tags = state.tags.filter((t) => t.id !== action.payload)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTags.pending, (state) => {
        state.status = 'pending'
      })
      .addCase(fetchTags.fulfilled, (state, action) => {
        state.status = 'success'
        state.tags = action.payload
      })
      .addCase(fetchTags.rejected, (state) => {
        state.status = 'failed'
      })
      .addCase(createTag.pending, (state) => {
        state.status = 'pending'
      })
      .addCase(createTag.fulfilled, (state, action) => {
        state.status = 'success'
        const exists = state.tags.find((t) => t.id === action.payload.id)
        if (!exists) {
          state.tags.push(action.payload)
        }
      })
      .addCase(createTag.rejected, (state) => {
        state.status = 'failed'
      })
      .addCase(updateTag.fulfilled, (state, action) => {
        const idx = state.tags.findIndex((t) => t.id === action.payload.id)
        if (idx !== -1) {
          state.tags[idx] = action.payload
        }
      })
      .addCase(deleteTag.fulfilled, (state, action) => {
        state.tags = state.tags.filter((t) => t.id !== action.payload)
      })
  },
})

export const { setTags, addTag, removeTag } = tagSlice.actions

export default tagSlice.reducer
