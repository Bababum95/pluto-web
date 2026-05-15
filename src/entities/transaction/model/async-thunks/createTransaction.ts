import { createAsyncThunk } from '@reduxjs/toolkit'

import dayjs from '@/shared/lib/date/dayjs'
import { LOCAL_DATA_MODE } from '@/shared/lib/local-storage/config'
import { generateTempEntityId } from '@/shared/lib/local-storage/temp-id'
import { isDateWithinBounds } from '@/shared/lib/date/isDateWithinBounds'
import { parseDecimal } from '@/shared/lib/money/utils/parseDecimal'
import { accountRepository } from '@/entities/account/local'
import { selectExchangeRates } from '@/entities/exchange-rate'
import { categoryRepository } from '@/entities/category'
import { selectCurrency } from '@/entities/settings'
import { tagRepository } from '@/entities/tag'
import type { MoneyViewCurrencyDto } from '@/shared/lib/money/types'
import type { AccountDto } from '@/shared/api/generated/model'
import type { AppDispatch, RootState } from '@/app/store'

import {
  transactionRepository,
  enqueueCreateTransaction,
  buildPlaceholderTransaction,
} from '../../local'

import { applyTransactionMutationSideEffects } from '../apply-transaction-mutation-side-effects'
import { transactionApi } from '../api'
import type {
  TransactionFormType,
  TransactionDto,
  TransactionMutationResponse,
} from '../dto-types'

type CreateTransactionResult =
  | { transaction: TransactionDto; insert: boolean }
  | (TransactionMutationResponse & { insert: boolean })

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

export const createTransaction = createAsyncThunk<
  CreateTransactionResult,
  TransactionFormType,
  { state: RootState; dispatch: AppDispatch }
>(
  'transaction/createTransaction',
  async (data: TransactionFormType, { getState, dispatch }) => {
    const rootState = getState()
    const { range } = rootState.timeRange
    const { balance, scale } = parseDecimal(data.amount)
    const date = dayjs(data.date).format('YYYY-MM-DD')
    const transactionType = rootState.transactionType.transactionType

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
        targetCurrency: resolveTargetCurrency(selectCurrency(rootState), account),
      })

      await transactionRepository.save(transaction)
      await enqueueCreateTransaction(tempId, {
        ...data,
        scale,
        date,
        amount: balance,
        type: transactionType,
      })

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

    applyTransactionMutationSideEffects(dispatch, response)

    return {
      ...response,
      insert: isDateWithinBounds(date, range),
    }
  }
)
