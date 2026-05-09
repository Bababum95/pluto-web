import { db } from '@/lib/local/db'
import { LOCAL_DATA_MODE } from '@/lib/local/config'

import type { CategoryDto } from '../model/types'
import { categoryRowFromDto, categoryDtoFromRow } from './schema'

export const categoryRepository = {
  async getById(id: string): Promise<CategoryDto | null> {
    if (LOCAL_DATA_MODE !== 'dexie') return null

    const row = await db.categories.get(id)
    return row ? categoryDtoFromRow(row) : null
  },

  async getAll(): Promise<CategoryDto[]> {
    if (LOCAL_DATA_MODE !== 'dexie') return []

    const rows = await db.categories.toArray()
    const categories = rows.map(categoryDtoFromRow)

    // Sort by order field to maintain category ordering
    return categories.sort((a, b) => a.order - b.order)
  },

  async save(category: CategoryDto): Promise<void> {
    if (LOCAL_DATA_MODE !== 'dexie') return

    const now = new Date().toISOString()
    const row = categoryRowFromDto(category, now)

    await db.categories.put({
      ...row,
      syncedAt: now,
      isDirty: false,
    })
  },

  async saveMany(categories: CategoryDto[]): Promise<void> {
    if (LOCAL_DATA_MODE !== 'dexie') return

    const now = new Date().toISOString()
    const rows = categories.map((c) => ({
      ...categoryRowFromDto(c, now),
      syncedAt: now,
      isDirty: false,
    }))

    await db.categories.bulkPut(rows)
  },

  async update(id: string, data: Partial<CategoryDto>): Promise<void> {
    if (LOCAL_DATA_MODE !== 'dexie') return

    const existing = await db.categories.get(id)
    if (!existing) return

    const updated: CategoryDto = {
      ...existing.payload,
      ...data,
    }

    const now = new Date().toISOString()
    await db.categories.update(id, {
      payload: updated,
      updatedAt: now,
      isDirty: true,
    })
  },

  async delete(id: string): Promise<void> {
    if (LOCAL_DATA_MODE !== 'dexie') return

    await db.categories.delete(id)
  },

  async syncFromApi(categories: CategoryDto[]): Promise<void> {
    if (LOCAL_DATA_MODE !== 'dexie') return

    // Validate input
    if (!Array.isArray(categories)) {
      console.error('syncFromApi: invalid categories data, expected array')
      return
    }

    const now = new Date().toISOString()

    // Get all existing categories to check for dirty records
    const existingRows = await db.categories.toArray()
    const dirtyIds = new Set(
      existingRows.filter((row) => row.isDirty).map((row) => row.id)
    )

    // Only sync categories that are not dirty locally
    const toSync = categories.filter((cat) => {
      // Validate category has required fields
      if (!cat.id || !cat.name) {
        console.warn('syncFromApi: skipping invalid category', cat)
        return false
      }
      return !dirtyIds.has(cat.id)
    })

    const rows = toSync.map((c) => ({
      ...categoryRowFromDto(c, c.updatedAt || now),
      syncedAt: now,
      isDirty: false,
    }))

    await db.categories.bulkPut(rows)
  },

  async clear(): Promise<void> {
    if (LOCAL_DATA_MODE !== 'dexie') return

    await db.categories.clear()
  },
}
