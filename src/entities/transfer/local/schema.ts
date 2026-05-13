import type { TransferDto } from '@/lib/api/generated/model'

/** IndexedDB row for the Dexie `transfers` table (denormalized fields for indexing). */
export type TransferRow = {
  id: string
  payload: TransferDto
  updatedAt: string
  syncedAt?: string
  /** True while optimistic/local-only row awaits sync */
  isDirty?: boolean
  fromAccountId: string
  toAccountId: string
  createdAt: string
}

export function transferRowFromDto(
  dto: TransferDto,
  updatedAt: string = new Date().toISOString()
): TransferRow {
  return {
    id: dto.id,
    payload: dto,
    updatedAt,
    fromAccountId: dto.from.account,
    toAccountId: dto.to.account,
    createdAt: dto.createdAt,
  }
}

export function transferDtoFromRow(row: TransferRow): TransferDto {
  return row.payload
}
