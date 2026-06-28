import {
  accountRepository,
  applyTransactionDeltaToAccount,
  calculateAccountsSummary,
  getSignedTransactionAmountRaw,
} from '@/entities/account'
import { categoryRepository } from '@/entities/category/local/repository'
import type { RateDto } from '@/entities/exchange-rate'
import { tagRepository } from '@/entities/tag/local/repository'
import { generateTempEntityId } from '@/shared/lib/local-storage/temp-id'
import type {
  CreateTransactionDto,
  SettingsDto,
  TransactionDto,
  TransactionMutationResponseDto,
  UpdateTransactionDto,
} from '@/shared/api/generated/model'

import { buildPlaceholderTransaction } from './build-placeholder-transaction'
import {
  enqueueCreateTransaction,
  enqueueDeleteTransaction,
  enqueueUpdateTransaction,
} from './outbox-helpers'
import {
  resolveSummaryCurrency,
  resolveTargetCurrency,
} from './resolve-currency'
import { transactionRepository } from './repository'
import { syncCoordinator } from '@/shared/lib/local-storage/sync-coordinator'

type SettingsCurrency =
  | import('@/shared/api/generated/model').CurrencyDto
  | { code: string; symbol: string; decimal_digits: number }

export type CreateTransactionLocalInput = {
  data: CreateTransactionDto
  rates: RateDto[]
  settingsCurrency: SettingsCurrency
  settings: SettingsDto | null | undefined
}

export type UpdateTransactionLocalInput = {
  id: string
  data: UpdateTransactionDto
  params?: Record<string, string>
}

export const transactionLocalApi = {
  async create(
    input: CreateTransactionLocalInput
  ): Promise<TransactionMutationResponseDto> {
    const { data, rates, settingsCurrency, settings } = input
    const tempId = generateTempEntityId()

    const account = await accountRepository.getById(data.account)
    if (!account) {
      throw new Error('Account not found')
    }

    const category = await categoryRepository.getById(data.category)

    if (!category) {
      throw new Error('Category not found')
    }

    const tagList = await Promise.all(
      (data.tags ?? []).map((id) => tagRepository.getById(id))
    )
    const tags = tagList.filter((t): t is NonNullable<typeof t> => t !== null)

    const targetCurrency = resolveTargetCurrency(settingsCurrency, account)
    const summaryCurrency = resolveSummaryCurrency(settings, account)

    const transaction = buildPlaceholderTransaction({
      id: tempId,
      account,
      category,
      tags,
      type: data.type,
      comment: data.comment,
      amountRaw: data.amount,
      scale: data.scale,
      date: data.date ?? '',
      rates,
      targetCurrency,
    })

    await transactionRepository.save(transaction)
    await enqueueCreateTransaction(tempId, data)
    void syncCoordinator.syncNow()

    const signedDelta = getSignedTransactionAmountRaw(data.type, data.amount)
    const updatedAccount = applyTransactionDeltaToAccount(
      account,
      signedDelta,
      rates,
      targetCurrency
    )

    await accountRepository.save(updatedAccount)

    const allAccounts = await accountRepository.getAll()
    const summary = calculateAccountsSummary(
      allAccounts,
      rates,
      targetCurrency,
      summaryCurrency
    )

    return {
      transaction,
      accounts: [updatedAccount],
      summary,
    }
  },

  async update(
    input: UpdateTransactionLocalInput
  ): Promise<{ transaction: TransactionDto }> {
    const { id, data, params } = input

    const existing = await transactionRepository.getById(id)
    if (!existing) {
      throw new Error('Transaction not found')
    }

    const category = await categoryRepository.getById(String(data.category))
    if (!category) {
      throw new Error('Category not found')
    }

    const tagIds = Array.isArray(data.tags) ? (data.tags as string[]) : []
    const tagList = await Promise.all(
      tagIds.map((tagId) => tagRepository.getById(tagId))
    )
    const tags = tagList.filter((t): t is NonNullable<typeof t> => t !== null)

    const scale = Number(data.scale)
    const balance = Number(data.amount)
    const date = String(data.date ?? existing.date)
    const transactionType = data.type as CreateTransactionDto['type']
    const divisor = 10 ** scale
    const value = balance / divisor

    await transactionRepository.update(id, {
      comment: typeof data.comment === 'string' ? data.comment : '',
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

    await enqueueUpdateTransaction(id, data, params)
    void syncCoordinator.syncNow()

    const transaction = await transactionRepository.getById(id)
    if (!transaction) {
      throw new Error('Transaction not found')
    }

    return { transaction }
  },

  async delete(id: string): Promise<void> {
    await transactionRepository.delete(id)
    await enqueueDeleteTransaction(id)
    void syncCoordinator.syncNow()
  },
}
