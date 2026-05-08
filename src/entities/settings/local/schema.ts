import type { SettingsDto } from '@/entities/settings'

export type SettingsRow = {
  id: string // всегда 'current' (singleton)
  payload: SettingsDto
  updatedAt: string
  syncedAt?: string
}

export function settingsRowFromDto(
  dto: SettingsDto,
  updatedAt: string = new Date().toISOString()
): SettingsRow {
  return {
    id: 'current',
    payload: dto,
    updatedAt,
  }
}

export function settingsDtoFromRow(row: SettingsRow): SettingsDto {
  return row.payload
}
