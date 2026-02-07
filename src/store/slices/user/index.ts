import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type { User } from '@/features/user/types'
import type { RootState } from '@/store'

type UserState = {
  user: User | null
  status: 'idle' | 'pending' | 'success' | 'failed'
}

const initialState: UserState = {
  user: null,
  status: 'idle',
}

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload
    },
    clearUser: (state) => {
      state.user = null
    },
  },
})

export const { setUser, clearUser } = userSlice.actions

export const selectUser = (state: RootState) => state.user.user

export default userSlice.reducer
