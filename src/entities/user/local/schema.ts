import type { UserDto } from '../model/types'

/** IndexedDB row for the Dexie `users` table. */
export type UserRow = {
  id: string
  payload: UserDto
  updatedAt: string
  syncedAt?: string
  isDirty?: boolean
}

export function userRowFromDto(
  dto: UserDto,
  updatedAt: string = new Date().toISOString()
): UserRow {
  return {
    id: dto.id,
    payload: dto,
    updatedAt,
  }
}

export function userDtoFromRow(row: UserRow): UserDto {
  return row.payload
}
