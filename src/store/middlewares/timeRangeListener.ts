import { createListenerMiddleware } from '@reduxjs/toolkit'

import {
  setTimeRange,
  setTimeRangeIndex,
  decreaseTimeRangeIndex,
  increaseTimeRangeIndex,
} from '../slices/time-range'
import { fetchTransactions } from '../slices/transaction'
import { fetchTransfers } from '../slices/transfer'

export const timeRangeListener = createListenerMiddleware()

const refetchData = async (
  _: unknown,
  api: { dispatch: (action: unknown) => unknown }
) => {
  await Promise.all([
    api.dispatch(fetchTransactions()),
    api.dispatch(fetchTransfers()),
  ])
}

timeRangeListener.startListening({
  actionCreator: setTimeRange,
  effect: refetchData,
})

timeRangeListener.startListening({
  actionCreator: setTimeRangeIndex,
  effect: refetchData,
})

timeRangeListener.startListening({
  actionCreator: decreaseTimeRangeIndex,
  effect: refetchData,
})

timeRangeListener.startListening({
  actionCreator: increaseTimeRangeIndex,
  effect: refetchData,
})
