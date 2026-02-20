import { createAsyncThunk } from '@reduxjs/toolkit'

import { settingsApi } from '@/features/settings'
import { selectAccountById } from '@/store/slices/account'
import type { RootState } from '@/store'

import { setAccount } from '../index'

export const setDefaultAccount = createAsyncThunk(
  'settings/setDefaultAccount',
  async (id: string, { dispatch, getState }) => {
    const state = getState() as RootState
    const account = selectAccountById(state, id)
    if (account) dispatch(setAccount(account))

    return await settingsApi.update({ account: id })
  }
)
