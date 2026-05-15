import { createAsyncThunk } from '@reduxjs/toolkit'

import dayjs from '@/shared/lib/date/dayjs'
import { LOCAL_DATA_MODE } from '@/shared/lib/local-storage/config'
import { parseDecimal } from '@/shared/lib/money/utils/parseDecimal'
import { categoryRepository } from '@/entities/category'
import { tagRepository } from '@/entities/tag'
import type { AppDispatch, RootState } from '@/app/store'

import { transactionRepository, enqueueUpdateTransaction } from '../../local'

import { transactionApi } from '../api'
import { applyTransactionMutationSideEffects } from '../apply-transaction-mutation-side-effects'
import type {
  TransactionDto,
  TransactionFormType,
  TransactionMutationResponse,
} from '../dto-types'

type Params = {
  id: string
  recalcBalance?: boolean
  data: TransactionFormType
}

export const updateTransaction = createAsyncThunk<
  { transaction: TransactionDto } | TransactionMutationResponse,
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

    const params: Record<string, string> | undefined =
      recalcBalance === true ? { recalcBalance: 'true' } : undefined

    if (LOCAL_DATA_MODE === 'dexie') {
      const existing = await transactionRepository.getById(id)
      if (!existing) throw new Error('Transaction not found')

      const category = await categoryRepository.getById(data.category)
      if (!category) throw new Error('Category not found')

      const tagList = await Promise.all(
        (data.tags ?? []).map((tid) => tagRepository.getById(tid))
      )
      const tags = tagList.filter((t): t is NonNullable<typeof t> => t !== null)

      const divisor = 10 ** scale
      const value = balance / divisor

      await transactionRepository.update(id, {
        comment: data.comment ?? '',
        date,
        type: transactionType,
        category,
        tags,
        updatedAt: new Date().toISOString(),
        amount: {
          original: {
            ...existing.amount.original,
            raw: balance,
            scale,
            value,
          },
          converted: {
            ...existing.amount.converted,
            raw: balance,
            scale,
            value,
          },
        },
      })

      await enqueueUpdateTransaction(id, body, params)

      const transaction = await transactionRepository.getById(id)
      if (!transaction) throw new Error('Transaction not found')

      return { transaction }
    }

    const response = await transactionApi.update(id, body, params)

    applyTransactionMutationSideEffects(dispatch, response)

    return response
  }
)
