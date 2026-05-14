import { createListenerMiddleware } from '@reduxjs/toolkit'

import { fetchTransactions } from '@/entities/transaction'

import { setTransactionType } from '../slices/transaction-type'

export const transactionTypeListener = createListenerMiddleware()

transactionTypeListener.startListening({
  actionCreator: setTransactionType,
  effect: async (_, api) => {
    await api.dispatch(fetchTransactions({ clear: true }))
  },
})
