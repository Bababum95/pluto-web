import { db } from '@/lib/local/db'
import { LOCAL_DATA_MODE } from '@/lib/local/config'
import type { RateDto } from '@/entities/exchange-rate'

import { exchangeRateRowFromDto, exchangeRateDtoFromRow } from './schema'

export const exchangeRateRepository = {
  async getAll(): Promise<RateDto[]> {
    if (LOCAL_DATA_MODE !== 'dexie') return []

    const rows = await db.exchangeRates.toArray()
    return rows.map(exchangeRateDtoFromRow)
  },

  async saveMany(rates: RateDto[]): Promise<void> {
    if (LOCAL_DATA_MODE !== 'dexie') return

    const now = new Date().toISOString()
    const rows = rates.map((r) => ({
      ...exchangeRateRowFromDto(r, now),
      syncedAt: now,
    }))

    await db.exchangeRates.bulkPut(rows)
  },

  async syncFromApi(rates: RateDto[]): Promise<void> {
    if (LOCAL_DATA_MODE !== 'dexie') return

    await this.saveMany(rates)
  },

  async clear(): Promise<void> {
    if (LOCAL_DATA_MODE !== 'dexie') return

    await db.exchangeRates.clear()
  },
}
