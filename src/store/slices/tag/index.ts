import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from '@reduxjs/toolkit'

import { tagApi } from '@/features/tag'
import type { Tag, TagFormValues } from '@/features/tag'
import type { RootState } from '@/store'
import type { Status } from '@/lib/types'

type TagState = {
  tags: Tag[]
  status: Status
}

const initialState: TagState = {
  tags: [],
  status: 'idle',
}

export const fetchTags = createAsyncThunk('tag/fetchTags', () => tagApi.list())

export const createTag = createAsyncThunk(
  'tag/createTag',
  (data: TagFormValues) => tagApi.create(data)
)

export const updateTag = createAsyncThunk(
  'tag/updateTag',
  ({ id, data }: { id: string; data: TagFormValues }) => tagApi.update(id, data)
)

export const deleteTag = createAsyncThunk('tag/deleteTag', (id: string) =>
  tagApi.delete(id)
)

export const tagSlice = createSlice({
  name: 'tag',
  initialState,
  reducers: {
    setTags: (state, action: PayloadAction<Tag[]>) => {
      state.tags = action.payload
    },
    addTag: (state, action: PayloadAction<Tag>) => {
      state.tags.push(action.payload)
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
        state.tags.push(action.payload)
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
        state.tags = state.tags.filter((t) => t.id !== action.meta.arg)
      })
  },
})

export const { setTags, addTag, removeTag } = tagSlice.actions

export const selectTags = (state: RootState) => state.tag.tags
export const selectTagsStatus = (state: RootState) => state.tag.status

export const selectTagById = (id: string) => (state: RootState) =>
  state.tag.tags.find((t) => t.id === id)

export default tagSlice.reducer
