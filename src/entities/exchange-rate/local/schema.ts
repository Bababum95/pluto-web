import type { RateDto } from '@/entities/exchange-rate'

/** IndexedDB row for the Dexie `exchangeRates` table. */
export type ExchangeRateRow = {
  id: string
  payload: RateDto
  updatedAt: string
  syncedAt?: string
}

export function exchangeRateRowFromDto(
  dto: RateDto,
  updatedAt: string = new Date().toISOString()
): ExchangeRateRow {
  return {
    id: dto.id,
    payload: dto,
    updatedAt,
  }
}

export function exchangeRateDtoFromRow(row: ExchangeRateRow): RateDto {
  return row.payload
}
