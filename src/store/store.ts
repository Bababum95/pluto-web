import { configureStore } from '@reduxjs/toolkit'

import transactionTypeReducer from './slices/transaction-type'
import timeRangeReducer from './slices/time-range'
import userReducer from './slices/user'

export const store = configureStore({
  reducer: {
    transactionType: transactionTypeReducer,
    timeRange: timeRangeReducer,
    user: userReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
