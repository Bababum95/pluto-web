import { configureStore } from '@reduxjs/toolkit'

import transactionTypeReducer from './slices/transaction-type'
import timeRangeReducer from './slices/time-range'
import userReducer from './slices/user'
import categoryReducer from './slices/category'
import accountReducer from './slices/account'
import settingsReducer from './slices/settings'

export const store = configureStore({
  reducer: {
    transactionType: transactionTypeReducer,
    timeRange: timeRangeReducer,
    user: userReducer,
    category: categoryReducer,
    account: accountReducer,
    settings: settingsReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppStore = typeof store
export type AppDispatch = typeof store.dispatch
