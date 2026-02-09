import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'

import { categoryApi } from '@/features/category'
import type { Category } from '@/features/category/types'
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
    updateCategory: (state, action: PayloadAction<Category>) => {
      const idx = state.categories.findIndex((c) => c.id === action.payload.id)
      if (idx !== -1) {
        state.categories[idx] = action.payload
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
  },
})

export const {
  setCategories,
  addCategory,
  updateCategory,
  removeCategory,
} = categorySlice.actions

export const selectCategories = (state: RootState) => state.category.categories
export const selectCategoriesStatus = (state: RootState) => state.category.status

export default categorySlice.reducer
