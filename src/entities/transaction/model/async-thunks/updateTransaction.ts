import { createAsyncThunk } from '@reduxjs/toolkit'

import dayjs from '@/shared/lib/date/dayjs'
import { LOCAL_DATA_MODE } from '@/shared/lib/local-storage/config'
import { parseDecimal } from '@/shared/lib/money/utils/parseDecimal'
import { accountsPatched } from '@/entities/account'
import type { AppDispatch, RootState } from '@/app/store'

import { transactionLocalApi } from '../../local'
import { transactionApi } from '../api'
import type {
  TransactionDto,
  TransactionFormType,
  TransactionMutationResponseDto,
  UpdateTransactionDto,
} from '../types'

type Params = {
  id: string
  recalcBalance?: boolean
  data: TransactionFormType
}

export const updateTransaction = createAsyncThunk<
  { transaction: TransactionDto } | TransactionMutationResponseDto,
  Params,
  { state: RootState; dispatch: AppDispatch }
>(
  'transaction/updateTransaction',
  async ({ id, recalcBalance, data }: Params, { getState, dispatch }) => {
    const rootState = getState()
    const { balance, scale } = parseDecimal(data.amount)
    const date = dayjs(data.date).format('YYYY-MM-DD')
    const transactionType = rootState.transactionType.transactionType

    const body = {
      ...data,
      scale,
      date,
      amount: balance,
      type: transactionType,
    }

    const params = {
      recalcBalance: recalcBalance ? 'true' : 'false',
    }

    if (LOCAL_DATA_MODE === 'dexie') {
      return transactionLocalApi.update({
        id,
        data: body as UpdateTransactionDto,
        params,
      })
    }

    const response = await transactionApi.update(id, body, params)

    dispatch(
      accountsPatched({
        accounts: response.accounts,
        summary: response.summary,
      })
    )

    return response
  }
)
