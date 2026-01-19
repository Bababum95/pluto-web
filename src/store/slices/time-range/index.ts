import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import { DEFAULT_TIME_RANGE } from '@/features/time-range/constants'
import type { TimeRangeType } from '@/features/time-range/types'

type TimeRangeState = {
  timeRange: TimeRangeType
  timeRangeIndex: number
}

const initialState: TimeRangeState = {
  timeRange: DEFAULT_TIME_RANGE,
  timeRangeIndex: 0,
}

export const timeRangeSlice = createSlice({
  name: 'timeRange',
  initialState,
  reducers: {
    setTimeRange: (state, action: PayloadAction<TimeRangeType>) => {
      state.timeRange = action.payload
    },
    setTimeRangeIndex: (state, action: PayloadAction<number>) => {
      state.timeRangeIndex = action.payload
    },
    decreaseTimeRangeIndex: (state) => {
      state.timeRangeIndex = Math.max(0, state.timeRangeIndex - 1)
    },
    increaseTimeRangeIndex: (state) => {
      state.timeRangeIndex = state.timeRangeIndex + 1
    },
  },
})

export const {
  setTimeRange,
  setTimeRangeIndex,
  decreaseTimeRangeIndex,
  increaseTimeRangeIndex,
} = timeRangeSlice.actions

export default timeRangeSlice.reducer
