import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from '@reduxjs/toolkit'

import { LOCAL_DATA_MODE } from '@/shared/lib/local-storage/config'
import { generateTempEntityId } from '@/shared/lib/local-storage/temp-id'
import { syncCoordinator } from '@/shared/lib/local-storage/sync-coordinator'
import { toDecimal } from '@/shared/lib/money/utils/toDecimal'
import type { Status } from '@/shared/lib/async-status'
import type { RootState } from '@/app/store'
import { selectExchangeRates } from '@/entities/exchange-rate'
import { selectCurrency, selectSettings } from '@/entities/settings'

import { accountRepository } from '../local'
import {
  enqueueCreateAccount,
  enqueueUpdateAccount,
  enqueueDeleteAccount,
  enqueueReorderAccounts,
  enqueueToggleExcluded,
} from '../local/outbox-helpers'
import {
  calculateAccountsSummary,
  resolveConvertedAccountBalance,
} from '../lib/transaction-balance'

import { accountApi } from './api'
import { resolveMoneyViewCurrencyForTempAccount } from './temp-account-currency'
import type {
  AccountDto,
  AccountSummaryDto,
  CreateAccountDto,
  UpdateAccountDto,
} from './types'

type AccountState = {
  accounts: AccountDto[]
  summary: AccountSummaryDto | null
  status: Status
}

const initialState: AccountState = {
  accounts: [],
  summary: null,
  status: 'idle',
}

type AccountsPatchedPayload = {
  accounts?: AccountDto[]
  summary?: AccountSummaryDto | null
}

function applyAccountUpdate(
  state: AccountState,
  accounts: AccountDto[] = [],
  summary?: AccountSummaryDto | null
) {
  if (summary) state.summary = summary

  accounts.forEach((account) => {
    const idx = state.accounts.findIndex((a) => a.id === account.id)

    if (idx !== -1) state.accounts[idx] = account
  })
}

export const fetchAccounts = createAsyncThunk(
  'account/fetchAccounts',
  async () => {
    if (LOCAL_DATA_MODE === 'dexie') {
      // Load from local first
      const accounts = await accountRepository.getAll()

      // Trigger background sync (non-blocking)
      syncCoordinator.syncNow().catch(console.error)

      // Return local data immediately
      // Note: summary is not stored locally, will be null initially
      return { list: accounts, summary: null }
    }

    return accountApi.list()
  }
)

export const deleteAccount = createAsyncThunk(
  'account/deleteAccount',
  async (id: string) => {
    if (LOCAL_DATA_MODE === 'dexie') {
      await accountRepository.delete(id)
      await enqueueDeleteAccount(id)
      return null // Summary not available locally
    }

    return accountApi.delete(id)
  }
)

export const createAccount = createAsyncThunk(
  'account/createAccount',
  async (data: CreateAccountDto, { getState }) => {
    if (LOCAL_DATA_MODE === 'dexie') {
      const tempId = generateTempEntityId()

      const currencyView = resolveMoneyViewCurrencyForTempAccount(
        data.currency,
        data.scale,
        getState as () => RootState
      )

      // Create a temporary account with placeholder balance structure
      // The real balance will come from the server after sync
      const tempAccount: AccountDto = {
        id: tempId,
        name: data.name,
        color: data.color,
        icon: data.icon,
        description: data.description,
        balance: {
          original: {
            value: (data.balance || 0) / Math.pow(10, data.scale),
            raw: data.balance || 0,
            scale: data.scale,
            currency: currencyView,
          },
          converted: {
            value: (data.balance || 0) / Math.pow(10, data.scale),
            raw: data.balance || 0,
            scale: data.scale,
            currency: currencyView,
          },
        },
        order: data.order || 0,
        excluded: data.excluded || false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      await accountRepository.save(tempAccount)
      await enqueueCreateAccount(tempId, data)

      return { account: tempAccount, summary: null }
    }

    return accountApi.create(data)
  }
)

export const updateAccount = createAsyncThunk(
  'account/updateAccount',
  async (
    { id, data }: { id: string; data: UpdateAccountDto },
    { getState }
  ) => {
    if (LOCAL_DATA_MODE === 'dexie') {
      // For local updates, we need to map UpdateAccountDto fields to AccountDto fields
      // UpdateAccountDto has balance as number, but AccountDto has balance as AccountBalanceViewDto
      const existing = await accountRepository.getById(id)
      if (!existing) throw new Error('Account not found')

      const state = getState() as RootState

      // Only update fields that are present in UpdateAccountDto and compatible with AccountDto
      const updates: Partial<AccountDto> = {}
      if (data.name !== undefined) updates.name = data.name as string
      if (data.color !== undefined) updates.color = data.color as string
      if (data.icon !== undefined) updates.icon = data.icon as string
      if (data.description !== undefined)
        updates.description = data.description as string
      if (data.order !== undefined) updates.order = data.order as number
      if (data.excluded !== undefined) updates.excluded = data.excluded as boolean

      const balanceRaw =
        typeof data.balance === 'number' ? data.balance : undefined
      const scale =
        typeof data.scale === 'number'
          ? data.scale
          : existing.balance.original.scale
      const currencyId =
        typeof data.currency === 'string' ? data.currency : undefined

      if (balanceRaw !== undefined || currencyId !== undefined) {
        const originalCurrency = currencyId
          ? resolveMoneyViewCurrencyForTempAccount(
              currencyId,
              scale,
              () => state
            )
          : existing.balance.original.currency

        const originalRaw = balanceRaw ?? existing.balance.original.raw
        const original = {
          ...existing.balance.original,
          currency: originalCurrency,
          scale,
          raw: originalRaw,
          value: toDecimal(originalRaw, scale),
        }

        const settingsCurrency = selectCurrency(state)
        const targetCurrency =
          'id' in settingsCurrency && settingsCurrency.id
            ? {
                id: settingsCurrency.id,
                code: settingsCurrency.code,
                symbol: settingsCurrency.symbol,
                decimal_digits: settingsCurrency.decimal_digits,
              }
            : existing.balance.converted.currency

        const accountForConversion: AccountDto = {
          ...existing,
          ...updates,
          balance: {
            original,
            converted: existing.balance.converted,
          },
        }

        updates.balance = {
          original,
          converted: resolveConvertedAccountBalance(
            accountForConversion,
            original,
            selectExchangeRates(state),
            targetCurrency
          ),
        }
      }

      await accountRepository.update(id, updates)
      await enqueueUpdateAccount(id, data)

      const updated = await accountRepository.getById(id)
      const allAccounts = await accountRepository.getAll()
      const settings = selectSettings(state)
      const settingsCurrency = selectCurrency(state)
      const targetCurrency =
        'id' in settingsCurrency && settingsCurrency.id
          ? {
              id: settingsCurrency.id,
              code: settingsCurrency.code,
              symbol: settingsCurrency.symbol,
              decimal_digits: settingsCurrency.decimal_digits,
            }
          : updated!.balance.converted.currency
      const summaryCurrency = settings?.currency ?? {
        id: targetCurrency.id,
        code: targetCurrency.code,
        symbol: targetCurrency.symbol,
        name: targetCurrency.code,
        symbol_native: targetCurrency.symbol,
        decimal_digits: targetCurrency.decimal_digits,
        rounding: 0,
        name_plural: targetCurrency.code,
        type: 'fiat' as const,
      }

      return {
        account: updated!,
        summary: calculateAccountsSummary(
          allAccounts,
          selectExchangeRates(state),
          targetCurrency,
          summaryCurrency
        ),
      }
    }

    return accountApi.update(id, data)
  }
)

export const reorderAccounts = createAsyncThunk(
  'account/reorderAccounts',
  async (ids: string[]): Promise<void> => {
    if (LOCAL_DATA_MODE === 'dexie') {
      // Update order locally
      const accounts = await accountRepository.getAll()
      const map = new Map(accounts.map((a) => [a.id, a]))

      for (let i = 0; i < ids.length; i++) {
        const account = map.get(ids[i])
        if (account) {
          await accountRepository.update(ids[i], { order: i })
        }
      }

      await enqueueReorderAccounts(ids)
      return
    }

    return accountApi.reorder({ ids })
  }
)

export const toggleExcluded = createAsyncThunk(
  'account/toggleExcluded',
  async (id: string) => {
    if (LOCAL_DATA_MODE === 'dexie') {
      const account = await accountRepository.getById(id)
      if (!account) throw new Error('Account not found')

      const updated = { ...account, excluded: !account.excluded }
      await accountRepository.save(updated)
      await enqueueToggleExcluded(id)

      return { account: updated, summary: null }
    }

    return accountApi.toggleExcluded(id)
  }
)

export const accountSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {
    setAccounts: (state, action: PayloadAction<AccountDto[]>) => {
      state.accounts = action.payload
    },
    addAccount: (state, action: PayloadAction<AccountDto>) => {
      const exists = state.accounts.find((a) => a.id === action.payload.id)
      if (exists) {
        Object.assign(exists, action.payload)
      } else {
        state.accounts.push(action.payload)
      }
    },
    updateAccountInState: (state, action: PayloadAction<AccountDto>) => {
      const idx = state.accounts.findIndex((a) => a.id === action.payload.id)
      if (idx !== -1) {
        state.accounts[idx] = action.payload
      }
    },
    accountsPatched: (state, action: PayloadAction<AccountsPatchedPayload>) => {
      applyAccountUpdate(
        state,
        action.payload.accounts ?? [],
        action.payload.summary
      )
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
        const exists = state.accounts.find(
          (a) => a.id === action.payload.account.id
        )
        if (!exists) {
          state.accounts.push(action.payload.account)
        }
        state.summary = action.payload.summary
      })
      .addCase(updateAccount.fulfilled, (state, action) => {
        applyAccountUpdate(
          state,
          [action.payload.account],
          action.payload.summary
        )
      })
      .addCase(reorderAccounts.fulfilled, (state, action) => {
        const ids = action.meta.arg as string[]
        const map = new Map(state.accounts.map((c) => [c.id, c]))

        state.accounts = ids
          .map((id, index) => {
            const account = map.get(id)
            if (!account) return undefined

            return { ...account, order: index }
          })
          .filter((c): c is (typeof state.accounts)[number] => Boolean(c))
      })
      .addCase(toggleExcluded.fulfilled, (state, action) => {
        applyAccountUpdate(
          state,
          [action.payload.account],
          action.payload.summary
        )
      })
  },
})

export const {
  setAccounts,
  addAccount,
  updateAccountInState,
  accountsPatched,
  removeAccount,
  setSummary,
} = accountSlice.actions

export default accountSlice.reducer
