import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from '@reduxjs/toolkit'

import { accountApi } from '@/features/account'
import type {
  Account,
  AccountSummaryDto,
  CreateAccountDto,
  UpdateAccountDto,
} from '@/features/account/types'
import { createTransaction } from '@/store/slices/transaction'
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

function applyAccountUpdate(
  state: AccountState,
  account: Account,
  summary: AccountSummaryDto
) {
  const idx = state.accounts.findIndex((a) => a.id === account.id)
  if (idx !== -1) {
    state.accounts[idx] = account
  }
  state.summary = summary
}

export const fetchAccounts = createAsyncThunk('account/fetchAccounts', () =>
  accountApi.list()
)

export const deleteAccount = createAsyncThunk(
  'account/deleteAccount',
  (id: string) => accountApi.delete(id)
)

export const createAccount = createAsyncThunk(
  'account/createAccount',
  (data: CreateAccountDto) => accountApi.create(data)
)

export const updateAccount = createAsyncThunk(
  'account/updateAccount',
  ({ id, data }: { id: string; data: UpdateAccountDto }) =>
    accountApi.update(id, data)
)

/**
 * Reorders accounts optimistically and sends order updates to backend in background.
 * Short press = navigate (Link handles it), long press (350ms) = drag.
 */
export const reorderAccounts = createAsyncThunk(
  'account/reorderAccounts',
  async (ids: string[]): Promise<void> => accountApi.reorder({ ids })
)

export const toggleExcluded = createAsyncThunk(
  'account/toggleExcluded',
  (id: string) => accountApi.toggleExcluded(id)
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
    setSummary: (state, action: PayloadAction<AccountSummaryDto | null>) => {
      state.summary = action.payload
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
        state.summary = action.payload
      })
      .addCase(createAccount.fulfilled, (state, action) => {
        state.accounts.push(action.payload.account)
        state.summary = action.payload.summary
      })
      .addCase(updateAccount.fulfilled, (state, action) => {
        applyAccountUpdate(
          state,
          action.payload.account,
          action.payload.summary
        )
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        applyAccountUpdate(
          state,
          action.payload.account,
          action.payload.summary
        )
      })
      .addCase(toggleExcluded.fulfilled, (state, action) => {
        applyAccountUpdate(
          state,
          action.payload.account,
          action.payload.summary
        )
      })
  },
})

export const { setAccounts, addAccount, removeAccount, setSummary } =
  accountSlice.actions

export * from './selectors'
export default accountSlice.reducer
