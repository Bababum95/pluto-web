import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from '@reduxjs/toolkit'

import { accountApi } from '@/features/account'
import type { Account, AccountSummaryDto } from '@/features/account/types'
import type { RootState } from '@/store'
import type { Status } from '@/lib/types'

type AccountState = {
  accounts: Account[]
  summary: AccountSummaryDto | null
  status: Status
}

const initialState: AccountState = {
  accounts: [],
  summary: null,
  status: 'idle',
}

export const fetchAccounts = createAsyncThunk('account/fetchAccounts', () =>
  accountApi.list()
)

export const deleteAccount = createAsyncThunk(
  'account/deleteAccount',
  (id: string) => accountApi.delete(id)
)

export const accountSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {
    setAccounts: (state, action: PayloadAction<Account[]>) => {
      state.accounts = action.payload
    },
    addAccount: (state, action: PayloadAction<Account>) => {
      state.accounts.push(action.payload)
    },
    updateAccount: (state, action: PayloadAction<Account>) => {
      const idx = state.accounts.findIndex((a) => a.id === action.payload.id)
      if (idx !== -1) {
        state.accounts[idx] = action.payload
      }
    },
    removeAccount: (state, action: PayloadAction<string>) => {
      state.accounts = state.accounts.filter((a) => a.id !== action.payload)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAccounts.pending, (state) => {
        state.status = 'pending'
      })
      .addCase(fetchAccounts.fulfilled, (state, action) => {
        state.status = 'success'
        state.accounts = action.payload.list
        state.summary = action.payload.summary
      })
      .addCase(fetchAccounts.rejected, (state) => {
        state.status = 'failed'
      })
      .addCase(deleteAccount.pending, (state) => {
        state.status = 'pending'
      })
      .addCase(deleteAccount.fulfilled, (state, action) => {
        state.status = 'success'
        state.accounts = state.accounts.filter((a) => a.id !== action.meta.arg)
      })
      .addCase(deleteAccount.rejected, (state) => {
        state.status = 'failed'
      })
  },
})

export const { setAccounts, addAccount, updateAccount, removeAccount } =
  accountSlice.actions

export const selectAccounts = (state: RootState) => state.account.accounts
export const selectAccountsSummary = (state: RootState) => state.account.summary
export const selectAccountsStatus = (state: RootState) => state.account.status

export default accountSlice.reducer
