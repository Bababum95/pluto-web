import { createAsyncThunk } from '@reduxjs/toolkit'

import { LOCAL_DATA_MODE } from '@/shared/lib/local-storage/config'
import { transferApi } from '../api'
import { selectTimeRangeFormatted } from '@/app/store/slices/time-range'
import type { RootState } from '@/app/store'

import { transferRepository } from '../../local'

let abortController: AbortController | null = null

export const fetchTransfers = createAsyncThunk(
  'transfer/fetchTransfers',
  async (_, { getState }) => {
    abortController?.abort()
    abortController = new AbortController()
    const signal = abortController.signal

    const rootState = getState() as RootState
    const range = selectTimeRangeFormatted(rootState)

    if (LOCAL_DATA_MODE === 'dexie') {
      if (!range) {
        const localAll = await transferRepository.getAll()
        transferApi
          .list(undefined, { signal })
          .then((apiList) => transferRepository.syncFromApi(apiList))
          .catch((err) => console.warn('Background transfer sync failed:', err))
        return localAll
      }

      const localList = await transferRepository.getByCreatedRange(
        range.from,
        range.to
      )

      if (localList.length > 0) {
        transferApi
          .list({ createdFrom: range.from, createdTo: range.to }, { signal })
          .then((apiList) => transferRepository.syncFromApi(apiList))
          .catch((err) => console.warn('Background transfer sync failed:', err))

        return localList
      }

      const apiList = await transferApi.list(
        { createdFrom: range.from, createdTo: range.to },
        { signal }
      )
      await transferRepository.syncFromApi(apiList)
      return apiList
    }

    return transferApi.list(
      { createdFrom: range?.from, createdTo: range?.to },
      { signal }
    )
  }
)
