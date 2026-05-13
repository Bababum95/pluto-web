import type { CategoryDto } from '../model/types'

/** IndexedDB row for the Dexie `categories` table. */
export type CategoryRow = {
  id: string
  payload: CategoryDto
  updatedAt: string
  syncedAt?: string
  isDirty?: boolean
}

export function categoryRowFromDto(
  dto: CategoryDto,
  updatedAt: string = new Date().toISOString()
): CategoryRow {
  return {
    id: dto.id,
    payload: dto,
    updatedAt,
  }
}

export function categoryDtoFromRow(row: CategoryRow): CategoryDto {
  return row.payload
}
