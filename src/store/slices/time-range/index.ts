import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import { DEFAULT_TIME_RANGE } from '@/features/time-range/constants'
import { getTimeRangeBounds } from '@/features/time-range/utils/getTimeRangeBounds'
import type { TimeRangeType } from '@/features/time-range/types'

export type TimeRangeState = {
  type: TimeRangeType
  index: number
  range: {
    from: string
    to: string
  }
}

const initialState: TimeRangeState = {
  type: DEFAULT_TIME_RANGE,
  index: 0,
  range: getTimeRangeBounds(DEFAULT_TIME_RANGE, 0),
}

export const timeRangeSlice = createSlice({
  name: 'timeRange',
  initialState,
  reducers: {
    setTimeRange: (state, action: PayloadAction<Partial<TimeRangeState>>) => {
      const type = action.payload.type ?? state.type
      const index = action.payload.index ?? 0
      state.type = type
      state.index = index

      if (type === 'period') {
        state.range = action.payload.range ?? state.range
      } else {
        state.range = getTimeRangeBounds(type, index)
      }
    },
    setTimeRangeIndex: (state, action: PayloadAction<number>) => {
      state.index = action.payload
      if (state.type !== 'period') {
        state.range = getTimeRangeBounds(state.type, action.payload)
      }
    },
    decreaseTimeRangeIndex: (state) => {
      const index = Math.max(0, state.index - 1)
      state.index = index
      if (state.type !== 'period') {
        state.range = getTimeRangeBounds(state.type, index)
      }
    },
    increaseTimeRangeIndex: (state) => {
      const index = state.index + 1
      state.index = index
      if (state.type !== 'period') {
        state.range = getTimeRangeBounds(state.type, index)
      }
    },
  },
})

export const {
  setTimeRange,
  setTimeRangeIndex,
  decreaseTimeRangeIndex,
  increaseTimeRangeIndex,
} = timeRangeSlice.actions

export * from './selectors'
export default timeRangeSlice.reducer
