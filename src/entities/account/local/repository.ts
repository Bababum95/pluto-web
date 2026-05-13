import { db } from '@/lib/local/db'
import { LOCAL_DATA_MODE } from '@/lib/local/config'

import type { AccountDto } from '@/features/account/types'
import { accountRowFromDto, accountDtoFromRow } from './schema'

export const accountRepository = {
  async getById(id: string): Promise<AccountDto | null> {
    if (LOCAL_DATA_MODE !== 'dexie') return null

    const row = await db.accounts.get(id)
    return row ? accountDtoFromRow(row) : null
  },

  async getAll(): Promise<AccountDto[]> {
    if (LOCAL_DATA_MODE !== 'dexie') return []

    const rows = await db.accounts.toArray()
    const accounts = rows.map(accountDtoFromRow)

    // Sort by order field to maintain account ordering
    return accounts.sort((a, b) => a.order - b.order)
  },

  async save(account: AccountDto): Promise<void> {
    if (LOCAL_DATA_MODE !== 'dexie') return

    const now = new Date().toISOString()
    const row = accountRowFromDto(account, now)

    await db.accounts.put({
      ...row,
      syncedAt: now,
      isDirty: false,
    })
  },

  async saveMany(accounts: AccountDto[]): Promise<void> {
    if (LOCAL_DATA_MODE !== 'dexie') return

    const now = new Date().toISOString()
    const rows = accounts.map((a) => ({
      ...accountRowFromDto(a, now),
      syncedAt: now,
      isDirty: false,
    }))

    await db.accounts.bulkPut(rows)
  },

  async update(id: string, data: Partial<AccountDto>): Promise<void> {
    if (LOCAL_DATA_MODE !== 'dexie') return

    const existing = await db.accounts.get(id)
    if (!existing) return

    const updated: AccountDto = {
      ...existing.payload,
      ...data,
    }

    const now = new Date().toISOString()
    await db.accounts.update(id, {
      payload: updated,
      updatedAt: now,
      isDirty: true,
    })
  },

  async delete(id: string): Promise<void> {
    if (LOCAL_DATA_MODE !== 'dexie') return

    await db.accounts.delete(id)
  },

  async syncFromApi(accounts: AccountDto[]): Promise<void> {
    if (LOCAL_DATA_MODE !== 'dexie') return

    // Validate input
    if (!Array.isArray(accounts)) {
      console.error('syncFromApi: invalid accounts data, expected array')
      return
    }

    const now = new Date().toISOString()

    // Get all existing accounts to check for dirty records
    const existingRows = await db.accounts.toArray()
    const dirtyIds = new Set(
      existingRows.filter((row) => row.isDirty).map((row) => row.id)
    )

    // Only sync accounts that are not dirty locally
    const toSync = accounts.filter((account) => {
      // Validate account has required fields
      if (!account.id || !account.name) {
        console.warn('syncFromApi: skipping invalid account', account)
        return false
      }
      return !dirtyIds.has(account.id)
    })

    const rows = toSync.map((a) => ({
      ...accountRowFromDto(a, a.updatedAt || now),
      syncedAt: now,
      isDirty: false,
    }))

    await db.accounts.bulkPut(rows)
  },

  async clear(): Promise<void> {
    if (LOCAL_DATA_MODE !== 'dexie') return

    await db.accounts.clear()
  },
}
