import { db } from '@/shared/lib/local-storage/db'
import { LOCAL_DATA_MODE } from '@/shared/lib/local-storage/config'
import { needsSync } from '@/shared/lib/local-storage/sync-utils'

import type { UserDto } from '../model/types'
import { userRowFromDto, userDtoFromRow } from './schema'

export const userRepository = {
  async getById(id: string): Promise<UserDto | null> {
    if (LOCAL_DATA_MODE !== 'dexie') return null

    const row = await db.users.get(id)
    return row ? userDtoFromRow(row) : null
  },

  async getAll(): Promise<UserDto[]> {
    if (LOCAL_DATA_MODE !== 'dexie') return []

    const rows = await db.users.toArray()
    return rows.map(userDtoFromRow)
  },

  async save(user: UserDto): Promise<void> {
    if (LOCAL_DATA_MODE !== 'dexie') return

    const now = new Date().toISOString()
    const row = userRowFromDto(user, now)

    await db.users.put({
      ...row,
      syncedAt: now,
      isDirty: false,
    })
  },

  async update(id: string, data: Partial<UserDto>): Promise<void> {
    if (LOCAL_DATA_MODE !== 'dexie') return

    const existing = await db.users.get(id)
    if (!existing) return

    const updated: UserDto = {
      ...existing.payload,
      ...data,
    }

    const now = new Date().toISOString()
    await db.users.update(id, {
      payload: updated,
      updatedAt: now,
      isDirty: true,
    })
  },

  async delete(id: string): Promise<void> {
    if (LOCAL_DATA_MODE !== 'dexie') return

    await db.users.delete(id)
  },

  async syncFromApi(user: UserDto): Promise<void> {
    if (LOCAL_DATA_MODE !== 'dexie') return

    const existing = await db.users.get(user.id)
    const now = new Date().toISOString()

    if (!existing) {
      await db.users.put({
        ...userRowFromDto(user, now),
        syncedAt: now,
        isDirty: false,
      })
      return
    }

    if (existing.isDirty) {
      return
    }

    if (needsSync(existing.updatedAt, user.updatedAt || now)) {
      await db.users.update(user.id, {
        payload: user,
        updatedAt: user.updatedAt || now,
        syncedAt: now,
        isDirty: false,
      })
    }
  },

  async syncToApi(id: string): Promise<void> {
    if (LOCAL_DATA_MODE !== 'dexie') return

    const row = await db.users.get(id)
    if (!row || !row.isDirty) return

    const now = new Date().toISOString()
    await db.users.update(id, {
      syncedAt: now,
      isDirty: false,
    })
  },

  async clear(): Promise<void> {
    if (LOCAL_DATA_MODE !== 'dexie') return

    await db.users.clear()
  },
}
