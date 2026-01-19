import { configureStore } from '@reduxjs/toolkit'

import transactionTypeReducer from './slices/transaction-type'
import timeRangeReducer from './slices/time-range'

export const store = configureStore({
  reducer: {
    transactionType: transactionTypeReducer,
    timeRange: timeRangeReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
