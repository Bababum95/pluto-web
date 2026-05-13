import { db } from '@/lib/local/db'
import { LOCAL_DATA_MODE } from '@/lib/local/config'

import type { TagDto } from '../model/types'
import { tagRowFromDto, tagDtoFromRow } from './schema'

export const tagRepository = {
  async getById(id: string): Promise<TagDto | null> {
    if (LOCAL_DATA_MODE !== 'dexie') return null

    const row = await db.tags.get(id)
    return row ? tagDtoFromRow(row) : null
  },

  async getAll(): Promise<TagDto[]> {
    if (LOCAL_DATA_MODE !== 'dexie') return []

    const rows = await db.tags.toArray()
    return rows.map(tagDtoFromRow)
  },

  async save(tag: TagDto): Promise<void> {
    if (LOCAL_DATA_MODE !== 'dexie') return

    const now = new Date().toISOString()
    const row = tagRowFromDto(tag, now)

    await db.tags.put({
      ...row,
      syncedAt: now,
    })
  },

  async saveMany(tags: TagDto[]): Promise<void> {
    if (LOCAL_DATA_MODE !== 'dexie') return

    const now = new Date().toISOString()
    const rows = tags.map((t) => ({
      ...tagRowFromDto(t, now),
      syncedAt: now,
    }))

    await db.tags.bulkPut(rows)
  },

  async delete(id: string): Promise<void> {
    if (LOCAL_DATA_MODE !== 'dexie') return

    await db.tags.delete(id)
  },

  async syncFromApi(tags: TagDto[]): Promise<void> {
    if (LOCAL_DATA_MODE !== 'dexie') return

    await this.saveMany(tags)
  },

  async clear(): Promise<void> {
    if (LOCAL_DATA_MODE !== 'dexie') return

    await db.tags.clear()
  },
}
