import { configureStore } from '@reduxjs/toolkit'

import transactionTypeReducer from './slices/transaction-type'
import timeRangeReducer from './slices/time-range'
import userReducer from './slices/user'
import appReducer from './slices/app'
import categoryReducer from './slices/category'
import tagReducer from './slices/tag'
import accountReducer from './slices/account'
import settingsReducer from './slices/settings'
import transactionReducer from './slices/transaction'
import exchangeRateReducer from './slices/exchange-rate'
import transferReducer from './slices/transfer'

import { timeRangeListener } from './middlewares/timeRangeListener'
import { transactionTypeListener } from './middlewares/transactionTypeListener'

export const store = configureStore({
  reducer: {
    transactionType: transactionTypeReducer,
    timeRange: timeRangeReducer,
    user: userReducer,
    app: appReducer,
    category: categoryReducer,
    tag: tagReducer,
    account: accountReducer,
    settings: settingsReducer,
    transaction: transactionReducer,
    exchangeRate: exchangeRateReducer,
    transfer: transferReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      transactionTypeListener.middleware,
      timeRangeListener.middleware
    ),
})

export type RootState = ReturnType<typeof store.getState>
export type AppStore = typeof store
export type AppDispatch = typeof store.dispatch
