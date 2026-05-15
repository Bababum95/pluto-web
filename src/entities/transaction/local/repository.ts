import { db } from '@/shared/lib/local-storage/db'
import { LOCAL_DATA_MODE } from '@/shared/lib/local-storage/config'

import type {
  TransactionDto,
  TransactionDtoType,
} from '@/shared/api/generated/model'
import { transactionRowFromDto, transactionDtoFromRow } from './schema'

function compareTransactionsDesc(a: TransactionDto, b: TransactionDto): number {
  const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime()
  if (dateDiff !== 0) {
    return dateDiff
  }

  const createdAtDiff =
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  if (createdAtDiff !== 0) {
    return createdAtDiff
  }

  return b.id.localeCompare(a.id)
}

function sortByDateDesc(transactions: TransactionDto[]): TransactionDto[] {
  return transactions.sort(compareTransactionsDesc)
}

export const transactionRepository = {
  async getById(id: string): Promise<TransactionDto | null> {
    if (LOCAL_DATA_MODE !== 'dexie') return null

    const row = await db.transactions.get(id)
    return row ? transactionDtoFromRow(row) : null
  },

  async getAll(): Promise<TransactionDto[]> {
    if (LOCAL_DATA_MODE !== 'dexie') return []

    const rows = await db.transactions.toArray()
    return sortByDateDesc(rows.map(transactionDtoFromRow))
  },

  async getByAccount(accountId: string): Promise<TransactionDto[]> {
    if (LOCAL_DATA_MODE !== 'dexie') return []

    const rows = await db.transactions
      .where('accountId')
      .equals(accountId)
      .toArray()

    return sortByDateDesc(rows.map(transactionDtoFromRow))
  },

  async getByDateRange(from: string, to: string): Promise<TransactionDto[]> {
    if (LOCAL_DATA_MODE !== 'dexie') return []

    const rows = await db.transactions
      .where('date')
      .between(from, to, true, true)
      .toArray()

    return sortByDateDesc(rows.map(transactionDtoFromRow))
  },

  async getByDateRangeAndType(
    from: string,
    to: string,
    type: TransactionDtoType
  ): Promise<TransactionDto[]> {
    if (LOCAL_DATA_MODE !== 'dexie') return []

    const rows = await db.transactions
      .where('date')
      .between(from, to, true, true)
      .filter((row) => row.type === type)
      .toArray()

    return sortByDateDesc(rows.map(transactionDtoFromRow))
  },

  async save(transaction: TransactionDto): Promise<void> {
    if (LOCAL_DATA_MODE !== 'dexie') return

    const now = new Date().toISOString()
    const row = transactionRowFromDto(transaction, now)
    const isTemp = transaction.id.startsWith('temp-')

    await db.transactions.put({
      ...row,
      syncedAt: isTemp ? undefined : now,
      isDirty: isTemp,
    })
  },

  async saveMany(transactions: TransactionDto[]): Promise<void> {
    if (LOCAL_DATA_MODE !== 'dexie') return

    const now = new Date().toISOString()
    const rows = transactions.map((t) => {
      const isTemp = t.id.startsWith('temp-')
      return {
        ...transactionRowFromDto(t, now),
        syncedAt: isTemp ? undefined : now,
        isDirty: isTemp,
      }
    })

    await db.transactions.bulkPut(rows)
  },

  async update(id: string, data: Partial<TransactionDto>): Promise<void> {
    if (LOCAL_DATA_MODE !== 'dexie') return

    const existing = await db.transactions.get(id)
    if (!existing) return

    const updated: TransactionDto = {
      ...existing.payload,
      ...data,
    }

    const now = new Date().toISOString()
    const row = transactionRowFromDto(updated, now)

    await db.transactions.update(id, {
      payload: updated,
      updatedAt: now,
      isDirty: true,
      accountId: row.accountId,
      date: row.date,
      type: row.type,
    })
  },

  async delete(id: string): Promise<void> {
    if (LOCAL_DATA_MODE !== 'dexie') return

    await db.transactions.delete(id)
  },

  async syncFromApi(transactions: TransactionDto[]): Promise<void> {
    if (LOCAL_DATA_MODE !== 'dexie') return

    if (!Array.isArray(transactions)) {
      console.error('syncFromApi: invalid transactions data, expected array')
      return
    }

    const now = new Date().toISOString()

    const existingRows = await db.transactions.toArray()
    const dirtyIds = new Set(
      existingRows.filter((row) => row.isDirty).map((row) => row.id)
    )

    const toSync = transactions.filter((transaction) => {
      if (!transaction.id || !transaction.account?.id) {
        console.warn('syncFromApi: skipping invalid transaction', transaction)
        return false
      }
      return !dirtyIds.has(transaction.id)
    })

    const rows = toSync.map((transaction) => ({
      ...transactionRowFromDto(transaction, transaction.updatedAt || now),
      syncedAt: now,
      isDirty: false,
    }))

    await db.transactions.bulkPut(rows)
  },

  async clear(): Promise<void> {
    if (LOCAL_DATA_MODE !== 'dexie') return

    await db.transactions.clear()
  },
}
