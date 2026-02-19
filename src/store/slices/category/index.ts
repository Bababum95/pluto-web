import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from '@reduxjs/toolkit'

import { categoryApi } from '@/features/category'
import type { Category, CategoryFormValues } from '@/features/category/types'
import type { RootState } from '@/store'

type CategoryState = {
  categories: Category[]
  status: 'idle' | 'pending' | 'success' | 'failed'
}

const initialState: CategoryState = {
  categories: [],
  status: 'idle',
}

export const fetchCategories = createAsyncThunk(
  'category/fetchCategories',
  () => categoryApi.list()
)

export const createCategory = createAsyncThunk(
  'category/createCategory',
  (data: CategoryFormValues, { getState }) => {
    const rootState = getState() as RootState

    return categoryApi.create({
      ...data,
      type: rootState.transactionType.transactionType,
    })
  }
)

export const updateCategory = createAsyncThunk(
  'category/updateCategory',
  ({ id, data }: { id: string; data: CategoryFormValues }, { getState }) => {
    const rootState = getState() as RootState

    return categoryApi.update(id, {
      name: data.name,
      color: data.color,
      icon: data.icon,
      type: rootState.transactionType.transactionType,
    })
  }
)

// export const deleteCategory = createAsyncThunk(
//   'category/deleteCategory',
//   (id: string) => categoryApi.delete(id)
// )

export const categorySlice = createSlice({
  name: 'category',
  initialState,
  reducers: {
    setCategories: (state, action: PayloadAction<Category[]>) => {
      state.categories = action.payload
    },
    addCategory: (state, action: PayloadAction<Category>) => {
      state.categories.push(action.payload)
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
        state.categories.push(action.payload)
      })
      .addCase(createCategory.rejected, (state) => {
        state.status = 'failed'
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        const idx = state.categories.findIndex(
          (c) => c.id === action.payload.id
        )
        if (idx !== -1) {
          state.categories[idx] = action.payload
        }
      })
  },
})

export const { setCategories, addCategory, removeCategory } =
  categorySlice.actions

export const selectCategories = (state: RootState) => state.category.categories
export const selectCategoriesStatus = (state: RootState) =>
  state.category.status

export default categorySlice.reducer
