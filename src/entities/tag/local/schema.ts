import type { TagDto } from '@/features/tag/types'

export type TagRow = {
  id: string
  payload: TagDto
  updatedAt: string
  syncedAt?: string
}

export function tagRowFromDto(
  dto: TagDto,
  updatedAt: string = new Date().toISOString()
): TagRow {
  return {
    id: dto.id,
    payload: dto,
    updatedAt,
  }
}

export function tagDtoFromRow(row: TagRow): TagDto {
  return row.payload
}
