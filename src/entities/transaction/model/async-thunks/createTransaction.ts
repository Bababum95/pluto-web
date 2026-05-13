import { createAsyncThunk } from '@reduxjs/toolkit'

import dayjs from '@/lib/dayjs'
import { LOCAL_DATA_MODE } from '@/lib/local/config'
import { generateTempEntityId } from '@/lib/local/temp-id'
import { transactionApi } from '@/features/transaction'
import { isDateWithinBounds } from '@/features/time-range'
import { parseDecimal } from '@/features/money'
import { updateAccountInState, setSummary } from '@/entities/account'
import { accountRepository } from '@/entities/account/local'
import { categoryRepository } from '@/entities/category'
import { tagRepository } from '@/entities/tag'
import type { TransactionFormType } from '@/features/transaction/types'
import type { RootState } from '@/store'

import {
  transactionRepository,
  enqueueCreateTransaction,
  buildPlaceholderTransaction,
} from '../../local'

export const createTransaction = createAsyncThunk(
  'transaction/createTransaction',
  async (data: TransactionFormType, { getState, dispatch }) => {
    const rootState = getState() as RootState
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
        account: undefined,
        summary: undefined,
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

    if (response.account) {
      dispatch(updateAccountInState(response.account))
    }
    if (response.summary) {
      dispatch(setSummary(response.summary))
    }

    return {
      ...response,
      insert: isDateWithinBounds(date, range),
    }
  }
)
