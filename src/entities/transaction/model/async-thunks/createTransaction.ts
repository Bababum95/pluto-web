import { createAsyncThunk } from '@reduxjs/toolkit'

import dayjs from '@/shared/lib/date/dayjs'
import { LOCAL_DATA_MODE } from '@/shared/lib/local-storage/config'
import { isDateWithinBounds } from '@/shared/lib/date/isDateWithinBounds'
import { parseDecimal } from '@/shared/lib/money/utils/parseDecimal'
import { accountsPatched } from '@/entities/account'
import {
  exchangeRateRepository,
  selectExchangeRates,
  type RateDto,
} from '@/entities/exchange-rate'
import { selectCurrency, selectSettings } from '@/entities/settings'
import type { AppDispatch, RootState } from '@/app/store'

import { transactionLocalApi } from '../../local'
import { transactionApi } from '../api'
import type {
  TransactionFormType,
  TransactionMutationResponseDto,
} from '../types'

type CreateTransactionResult = TransactionMutationResponseDto & {
  insert: boolean
}

async function resolveRatesForLocalCreate(
  rootState: RootState
): Promise<RateDto[]> {
  const fromStore = selectExchangeRates(rootState)
  if (fromStore.length > 0) {
    return fromStore
  }

  // IndexedDB may already have rates from a background sync that has not
  // reached Redux yet (fetchExchangeRates returns local data immediately).
  return exchangeRateRepository.getAll()
}

export const createTransaction = createAsyncThunk<
  CreateTransactionResult,
  TransactionFormType,
  { state: RootState; dispatch: AppDispatch }
>(
  'transaction/createTransaction',
  async (
    { date, amount, ...rest }: TransactionFormType,
    { getState, dispatch }
  ) => {
    const rootState = getState()

    const transactionType = rootState.transactionType.transactionType
    const { range } = rootState.timeRange

    const formattedDate = dayjs(date).format('YYYY-MM-DD')
    const { balance, scale } = parseDecimal(amount)

    const body = {
      ...rest,
      scale,
      date: formattedDate,
      amount: balance,
      type: transactionType,
    }

    const response =
      LOCAL_DATA_MODE === 'dexie'
        ? await transactionLocalApi.create({
            data: body,
            rates: await resolveRatesForLocalCreate(rootState),
            settingsCurrency: selectCurrency(rootState),
            settings: selectSettings(rootState),
          })
        : await transactionApi.create(body)

    dispatch(
      accountsPatched({
        accounts: response.accounts,
        summary: response.summary,
      })
    )

    return {
      ...response,
      insert: isDateWithinBounds(formattedDate, range),
    }
  }
)
