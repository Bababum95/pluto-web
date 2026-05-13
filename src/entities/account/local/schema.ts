import type { AccountDto } from '@/entities/account/model/types'

/** IndexedDB row for the Dexie `accounts` table. */
export type AccountRow = {
  id: string
  payload: AccountDto
  updatedAt: string
  syncedAt?: string
  isDirty?: boolean
}

export function accountRowFromDto(
  dto: AccountDto,
  updatedAt: string = new Date().toISOString()
): AccountRow {
  return {
    id: dto.id,
    payload: dto,
    updatedAt,
  }
}

export function accountDtoFromRow(row: AccountRow): AccountDto {
  return row.payload
}
