import { configureStore } from '@reduxjs/toolkit'

import { userReducer } from '@/entities/user'
import { tagReducer } from '@/entities/tag'
import { categoryReducer } from '@/entities/category'
import { accountReducer } from '@/entities/account'
import { exchangeRateReducer } from '@/entities/exchange-rate'
import { settingsReducer } from '@/entities/settings'

import transactionTypeReducer from './slices/transaction-type'
import timeRangeReducer from './slices/time-range'
import appReducer from './slices/app'
import transactionReducer from './slices/transaction'
import transferReducer from './slices/transfer'

import { timeRangeListener } from './middlewares/timeRangeListener'
import { transactionTypeListener } from './middlewares/transactionTypeListener'

const reducer = {
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
}

export const store = configureStore({
  reducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      transactionTypeListener.middleware,
      timeRangeListener.middleware
    ),
})

export type RootState = ReturnType<typeof store.getState>
export type AppStore = typeof store
export type AppDispatch = typeof store.dispatch

/** Creates a store with optional preloaded state (for tests). */
export function createStore(preloadedState?: Partial<RootState>): AppStore {
  return configureStore({
    reducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(
        transactionTypeListener.middleware,
        timeRangeListener.middleware
      ),
    preloadedState,
    // RTK infers stricter types when preloadedState is used; cast to match app store.
  } as import('@reduxjs/toolkit').ConfigureStoreOptions<RootState>) as AppStore
}
