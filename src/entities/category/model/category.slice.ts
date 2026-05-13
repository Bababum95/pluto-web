import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from '@reduxjs/toolkit'

import { categoryApi } from './api'
import { categoryRepository } from '../local/repository'
import {
  enqueueCreateCategory,
  enqueueUpdateCategory,
  enqueueDeleteCategory,
  enqueueReorderCategories,
} from '../local/outbox-helpers'
import { LOCAL_DATA_MODE } from '@/lib/local/config'
import { generateTempEntityId } from '@/lib/local/temp-id'
import type { CategoryDto, CategoryFormValues } from './types'
import type { RootState } from '@/store'

type CategoryState = {
  categories: CategoryDto[]
  status: 'idle' | 'pending' | 'success' | 'failed'
}

const initialState: CategoryState = {
  categories: [],
  status: 'idle',
}

export const fetchCategories = createAsyncThunk(
  'category/fetchCategories',
  async () => {
    if (LOCAL_DATA_MODE === 'dexie') {
      // Load from local DB first for instant UI
      const localCategories = await categoryRepository.getAll()

      if (localCategories.length > 0) {
        // Return local data immediately, but trigger background sync
        categoryApi
          .list()
          .then((apiCategories) =>
            categoryRepository.syncFromApi(apiCategories)
          )
          .catch((err) => console.warn('Background category sync failed:', err))

        return localCategories
      }

      // Fallback to API if empty
      const apiCategories = await categoryApi.list()
      await categoryRepository.saveMany(apiCategories)
      return apiCategories
    } else {
      // api-only mode
      return categoryApi.list()
    }
  }
)

/**
 * Create a new category.
 * In dexie mode: save locally with temp ID, enqueue for sync.
 * In api-only mode: create via API directly.
 */
export const createCategory = createAsyncThunk(
  'category/createCategory',
  async (data: CategoryFormValues, { getState }) => {
    const rootState = getState() as RootState
    const payload = {
      ...data,
      type: rootState.transactionType.transactionType,
    }

    if (LOCAL_DATA_MODE === 'dexie') {
      const tempId = generateTempEntityId()
      const tempCategory: CategoryDto = {
        id: tempId,
        ...payload,
        order: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      await categoryRepository.save(tempCategory)
      await enqueueCreateCategory(tempId, payload)

      return tempCategory
    }

    return categoryApi.create(payload)
  }
)

/**
 * Update an existing category.
 * In dexie mode: update locally, enqueue for sync.
 * In api-only mode: update via API directly.
 */
export const updateCategory = createAsyncThunk(
  'category/updateCategory',
  async (
    { id, data }: { id: string; data: CategoryFormValues },
    { getState }
  ) => {
    const rootState = getState() as RootState
    const payload = {
      name: data.name,
      color: data.color,
      icon: data.icon,
      type: rootState.transactionType.transactionType,
    }

    if (LOCAL_DATA_MODE === 'dexie') {
      await categoryRepository.update(id, payload)
      await enqueueUpdateCategory(id, payload)

      const updated = await categoryRepository.getById(id)
      if (!updated) throw new Error(`Category ${id} not found after update`)
      return updated
    }

    return categoryApi.update(id, payload)
  }
)

/**
 * Reorder categories.
 * In dexie mode: update order locally, enqueue for sync.
 * In api-only mode: reorder via API directly.
 */
export const reorderCategories = createAsyncThunk(
  'category/reorderCategories',
  async (ids: string[]) => {
    if (LOCAL_DATA_MODE === 'dexie') {
      for (let i = 0; i < ids.length; i++) {
        await categoryRepository.update(ids[i], { order: i })
      }
      await enqueueReorderCategories(ids)

      return { ids }
    }

    return categoryApi.reorder({ ids })
  }
)

/**
 * Delete a category.
 * In dexie mode: delete locally, enqueue for sync.
 * In api-only mode: delete via API directly.
 */
export const deleteCategory = createAsyncThunk(
  'category/deleteCategory',
  async (id: string) => {
    if (LOCAL_DATA_MODE === 'dexie') {
      await categoryRepository.delete(id)
      await enqueueDeleteCategory(id)
      return id
    }

    await categoryApi.delete(id)
    return id
  }
)

export const categorySlice = createSlice({
  name: 'category',
  initialState,
  reducers: {
    setCategories: (state, action: PayloadAction<CategoryDto[]>) => {
      state.categories = action.payload
    },
    addCategory: (state, action: PayloadAction<CategoryDto>) => {
      const exists = state.categories.find((c) => c.id === action.payload.id)
      if (exists) {
        Object.assign(exists, action.payload)
      } else {
        state.categories.push(action.payload)
      }
    },
    removeCategory: (state, action: PayloadAction<string>) => {
      state.categories = state.categories.filter((c) => c.id !== action.payload)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.status = 'pending'
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.status = 'success'
        state.categories = action.payload
      })
      .addCase(fetchCategories.rejected, (state) => {
        state.status = 'failed'
      })
      .addCase(createCategory.pending, (state) => {
        state.status = 'pending'
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.status = 'success'
        const exists = state.categories.find((c) => c.id === action.payload.id)
        if (!exists) {
          state.categories.push(action.payload)
        }
      })
      .addCase(createCategory.rejected, (state) => {
        state.status = 'failed'
      })
      .addCase(reorderCategories.fulfilled, (state, action) => {
        const ids = action.meta.arg as string[]
        const map = new Map(state.categories.map((c) => [c.id, c]))

        state.categories = ids
          .map((id, index) => {
            const category = map.get(id)
            if (!category) return undefined

            return { ...category, order: index }
          })
          .filter((c): c is (typeof state.categories)[number] => Boolean(c))
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        const idx = state.categories.findIndex(
          (c) => c.id === action.payload.id
        )
        if (idx !== -1) {
          state.categories[idx] = action.payload
        }
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.categories = state.categories.filter(
          (c) => c.id !== action.payload
        )
      })
  },
})

export const { setCategories, addCategory, removeCategory } =
  categorySlice.actions

export default categorySlice.reducer
