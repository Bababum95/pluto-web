import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type { Status } from '@/lib/types'

import type { UserDto } from './types'

type UserState = {
  user: UserDto | null
  status: Status
}

const initialState: UserState = {
  user: null,
  status: 'idle',
}

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserDto>) => {
      state.user = action.payload
    },
    clearUser: (state) => {
      state.user = null
    },
  },
})

export const { setUser, clearUser } = userSlice.actions
export default userSlice.reducer
