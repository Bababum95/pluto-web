import { createAsyncThunk } from '@reduxjs/toolkit'

import dayjs from '@/shared/lib/date/dayjs'
import { LOCAL_DATA_MODE } from '@/shared/lib/local-storage/config'
import { generateTempEntityId } from '@/shared/lib/local-storage/temp-id'
import { isDateWithinBounds } from '@/shared/lib/date/isDateWithinBounds'
import { parseDecimal } from '@/shared/lib/money/utils/parseDecimal'
import {
  accountRepository,
  accountsPatched,
  applyTransactionDeltaToAccount,
  calculateAccountsSummary,
  getSignedTransactionAmountRaw,
} from '@/entities/account'
import { selectExchangeRates } from '@/entities/exchange-rate'
import { categoryRepository } from '@/entities/category'
import { selectCurrency, selectSettings } from '@/entities/settings'
import { tagRepository } from '@/entities/tag'
import type { CurrencyDto } from '@/shared/api/generated/model'
import type { MoneyViewCurrencyDto } from '@/shared/lib/money/types'
import type { AccountDto } from '@/shared/api/generated/model'
import type { AppDispatch, RootState } from '@/app/store'

import {
  transactionRepository,
  enqueueCreateTransaction,
  buildPlaceholderTransaction,
} from '../../local'

import { transactionApi } from '../api'
import type {
  TransactionFormType,
  TransactionDto,
  TransactionMutationResponseDto,
} from '../types'

type CreateTransactionResult =
  | { transaction: TransactionDto; insert: boolean }
  | (TransactionMutationResponseDto & { insert: boolean })

function resolveTargetCurrency(
  settingsCurrency: ReturnType<typeof selectCurrency>,
  account: AccountDto
): MoneyViewCurrencyDto {
  if ('id' in settingsCurrency && settingsCurrency.id) {
    return {
      id: settingsCurrency.id,
      code: settingsCurrency.code,
      symbol: settingsCurrency.symbol,
      decimal_digits: settingsCurrency.decimal_digits,
    }
  }

  return account.balance.converted.currency
}

function resolveSummaryCurrency(
  settings: ReturnType<typeof selectSettings>,
  account: AccountDto
): CurrencyDto {
  if (settings?.currency) {
    return settings.currency
  }

  const view = account.balance.converted.currency
  return {
    id: view.id,
    code: view.code,
    symbol: view.symbol,
    name: view.code,
    symbol_native: view.symbol,
    decimal_digits: view.decimal_digits,
    rounding: 0,
    name_plural: view.code,
    type: 'fiat',
  }
}

export const createTransaction = createAsyncThunk<
  CreateTransactionResult,
  TransactionFormType,
  { state: RootState; dispatch: AppDispatch }
>(
  'transaction/createTransaction',
  async (data: TransactionFormType, { getState, dispatch }) => {
    const rootState = getState()
    const transactionType = rootState.transactionType.transactionType
    const date = dayjs(data.date).format('YYYY-MM-DD')
    const { range } = rootState.timeRange
    const { balance, scale } = parseDecimal(data.amount)

    if (LOCAL_DATA_MODE === 'dexie') {
      const tempId = generateTempEntityId()

      const account = await accountRepository.getById(data.account)
      const category = await categoryRepository.getById(data.category)

      if (!account) throw new Error('Account not found')
      if (!category) throw new Error('Category not found')

      const tagList = await Promise.all(
        (data.tags ?? []).map((id) => tagRepository.getById(id))
      )
      const tags = tagList.filter((t): t is NonNullable<typeof t> => t !== null)

      const transaction = buildPlaceholderTransaction({
        id: tempId,
        account,
        category,
        tags,
        type: transactionType,
        comment: data.comment,
        amountRaw: balance,
        scale,
        date,
        rates: selectExchangeRates(rootState),
        targetCurrency: resolveTargetCurrency(
          selectCurrency(rootState),
          account
        ),
      })

      await transactionRepository.save(transaction)
      await enqueueCreateTransaction(tempId, {
        ...data,
        scale,
        date,
        amount: balance,
        type: transactionType,
      })

      const rates = selectExchangeRates(rootState)
      const targetCurrency = resolveTargetCurrency(
        selectCurrency(rootState),
        account
      )
      const signedDelta = getSignedTransactionAmountRaw(
        transactionType,
        balance
      )
      const updatedAccount = applyTransactionDeltaToAccount(
        account,
        signedDelta,
        rates,
        targetCurrency
      )

      await accountRepository.save(updatedAccount)

      const allAccounts = await accountRepository.getAll()
      const summaryCurrency = resolveSummaryCurrency(
        selectSettings(rootState),
        account
      )
      const summary = calculateAccountsSummary(
        allAccounts,
        rates,
        targetCurrency,
        summaryCurrency
      )

      dispatch(
        accountsPatched({
          accounts: [updatedAccount],
          summary,
        })
      )

      return {
        transaction,
        insert: isDateWithinBounds(date, range),
      }
    }

    const response = await transactionApi.create({
      ...data,
      scale,
      date,
      amount: balance,
      type: transactionType,
    })

    if (
      (response.accounts?.length ?? 0) > 0 ||
      response.summary !== undefined
    ) {
      dispatch(
        accountsPatched({
          accounts: response.accounts,
          summary: response.summary,
        })
      )
    }

    return {
      ...response,
      insert: isDateWithinBounds(date, range),
    }
  }
)
