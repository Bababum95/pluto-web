import { createListenerMiddleware } from '@reduxjs/toolkit'

import { setTransactionType } from '../slices/transaction-type'
import { fetchTransactions } from '../slices/transaction'

export const transactionTypeListener = createListenerMiddleware()

transactionTypeListener.startListening({
  actionCreator: setTransactionType,
  effect: async (_, api) => {
    await api.dispatch(fetchTransactions())
  },
})
