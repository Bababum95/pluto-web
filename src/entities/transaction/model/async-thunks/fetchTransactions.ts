import { createAsyncThunk } from '@reduxjs/toolkit'

import { LOCAL_DATA_MODE } from '@/shared/lib/local-storage/config'
import { transactionApi } from '../api'
import type { RootState } from '@/store'

import { transactionRepository } from '../../local'

type FetchTransactionsPayload = {
  clear?: boolean
}

let abortController: AbortController | null = null

export const fetchTransactions = createAsyncThunk(
  'transaction/fetchTransactions',
  async (_payload: FetchTransactionsPayload | undefined, { getState }) => {
    abortController?.abort()
    abortController = new AbortController()
    const signal = abortController.signal

    const rootState = getState() as RootState
    const { range } = rootState.timeRange

    if (LOCAL_DATA_MODE === 'dexie') {
      const type = rootState.transactionType.transactionType
      const localList = await transactionRepository.getByDateRangeAndType(
        range.from,
        range.to,
        type
      )

      if (localList.length > 0) {
        transactionApi
          .list(
            {
              type,
              from: range.from,
              to: range.to,
            },
            { signal }
          )
          .then((apiList) => transactionRepository.syncFromApi(apiList))
          .catch((err) =>
            console.warn('Background transaction sync failed:', err)
          )

        return localList
      }

      const apiList = await transactionApi.list(
        {
          type,
          from: range.from,
          to: range.to,
        },
        { signal }
      )
      await transactionRepository.syncFromApi(apiList)
      return apiList
    }

    return transactionApi.list(
      {
        type: rootState.transactionType.transactionType,
        from: range.from,
        to: range.to,
      },
      { signal }
    )
  }
)
