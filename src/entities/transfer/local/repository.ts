import { db } from '@/lib/local/db'
import { LOCAL_DATA_MODE } from '@/lib/local/config'
import dayjs from '@/lib/dayjs'
import { DATE_FORMAT } from '@/features/time-range/constants'

import type { TransferDto } from '@/lib/api/generated/model'
import { transferRowFromDto, transferDtoFromRow, type TransferRow } from './schema'

function sortByCreatedDesc(transfers: TransferDto[]): TransferDto[] {
  return transfers.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

function isCreatedInRange(
  createdAt: string,
  from?: string,
  to?: string
): boolean {
  if (!from && !to) return true
  const d = dayjs(createdAt).format(DATE_FORMAT)
  if (from && d < from) return false
  if (to && d > to) return false
  return true
}

export const transferRepository = {
  async getById(id: string): Promise<TransferDto | null> {
    if (LOCAL_DATA_MODE !== 'dexie') return null

    const row = await db.transfers.get(id)
    return row ? transferDtoFromRow(row) : null
  },

  async getAll(): Promise<TransferDto[]> {
    if (LOCAL_DATA_MODE !== 'dexie') return []

    const rows = await db.transfers.toArray()
    return sortByCreatedDesc(rows.map(transferDtoFromRow))
  },

  async getByAccount(accountId: string): Promise<TransferDto[]> {
    if (LOCAL_DATA_MODE !== 'dexie') return []

    const fromRows = await db.transfers
      .where('fromAccountId')
      .equals(accountId)
      .toArray()
    const toRows = await db.transfers
      .where('toAccountId')
      .equals(accountId)
      .toArray()

    const byId = new Map<string, TransferRow>()
    for (const r of fromRows) byId.set(r.id, r)
    for (const r of toRows) byId.set(r.id, r)

    return sortByCreatedDesc(
      [...byId.values()].map(transferDtoFromRow)
    )
  },

  async getByCreatedRange(
    createdFrom?: string,
    createdTo?: string
  ): Promise<TransferDto[]> {
    if (LOCAL_DATA_MODE !== 'dexie') return []

    const rows = await db.transfers.toArray()
    const filtered = rows.filter((row) =>
      isCreatedInRange(row.createdAt, createdFrom, createdTo)
    )
    return sortByCreatedDesc(filtered.map(transferDtoFromRow))
  },

  async save(transfer: TransferDto): Promise<void> {
    if (LOCAL_DATA_MODE !== 'dexie') return

    const now = new Date().toISOString()
    const row = transferRowFromDto(transfer, now)
    const isTemp = transfer.id.startsWith('temp-')

    await db.transfers.put({
      ...row,
      syncedAt: isTemp ? undefined : now,
      isDirty: isTemp,
    })
  },

  async saveMany(transfers: TransferDto[]): Promise<void> {
    if (LOCAL_DATA_MODE !== 'dexie') return

    const now = new Date().toISOString()
    const rows = transfers.map((t) => {
      const isTemp = t.id.startsWith('temp-')
      return {
        ...transferRowFromDto(t, now),
        syncedAt: isTemp ? undefined : now,
        isDirty: isTemp,
      }
    })

    await db.transfers.bulkPut(rows)
  },

  async update(id: string, data: Partial<TransferDto>): Promise<void> {
    if (LOCAL_DATA_MODE !== 'dexie') return

    const existing = await db.transfers.get(id)
    if (!existing) return

    const updated: TransferDto = {
      ...existing.payload,
      ...data,
    }

    const now = new Date().toISOString()
    const row = transferRowFromDto(updated, now)

    await db.transfers.update(id, {
      payload: updated,
      updatedAt: now,
      isDirty: true,
      fromAccountId: row.fromAccountId,
      toAccountId: row.toAccountId,
      createdAt: row.createdAt,
    })
  },

  async delete(id: string): Promise<void> {
    if (LOCAL_DATA_MODE !== 'dexie') return

    await db.transfers.delete(id)
  },

  async syncFromApi(transfers: TransferDto[]): Promise<void> {
    if (LOCAL_DATA_MODE !== 'dexie') return

    if (!Array.isArray(transfers)) {
      console.error('syncFromApi: invalid transfers data, expected array')
      return
    }

    const now = new Date().toISOString()

    const existingRows = await db.transfers.toArray()
    const dirtyIds = new Set(
      existingRows.filter((row) => row.isDirty).map((row) => row.id)
    )

    const toSync = transfers.filter((transfer) => {
      if (
        !transfer.id ||
        !transfer.from?.account ||
        !transfer.to?.account
      ) {
        console.warn('syncFromApi: skipping invalid transfer', transfer)
        return false
      }
      return !dirtyIds.has(transfer.id)
    })

    const rows = toSync.map((transfer) => ({
      ...transferRowFromDto(transfer, transfer.updatedAt || now),
      syncedAt: now,
      isDirty: false,
    }))

    await db.transfers.bulkPut(rows)
  },

  async clear(): Promise<void> {
    if (LOCAL_DATA_MODE !== 'dexie') return

    await db.transfers.clear()
  },
}
