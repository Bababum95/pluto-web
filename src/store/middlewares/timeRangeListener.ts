import { createListenerMiddleware } from '@reduxjs/toolkit'

import {
  setTimeRange,
  setTimeRangeIndex,
  decreaseTimeRangeIndex,
  increaseTimeRangeIndex,
} from '../slices/time-range'
import { fetchTransactions } from '../slices/transaction'

export const timeRangeListener = createListenerMiddleware()

const refetchTransactions = async (
  _: unknown,
  api: { dispatch: (action: unknown) => unknown }
) => {
  await api.dispatch(fetchTransactions())
}

timeRangeListener.startListening({
  actionCreator: setTimeRange,
  effect: refetchTransactions,
})

timeRangeListener.startListening({
  actionCreator: setTimeRangeIndex,
  effect: refetchTransactions,
})

timeRangeListener.startListening({
  actionCreator: decreaseTimeRangeIndex,
  effect: refetchTransactions,
})

timeRangeListener.startListening({
  actionCreator: increaseTimeRangeIndex,
  effect: refetchTransactions,
})
