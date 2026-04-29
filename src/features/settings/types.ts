import type {
  SettingsDto,
  UpdateSettingsDto as GeneratedUpdateSettingsDto,
} from '@/lib/api/generated/model'

export type { SettingsDto }

/** Override: generated type has account as Record<string, never>; backend expects string | null (MongoDB ObjectId). */
export type UpdateSettingsDto = Omit<GeneratedUpdateSettingsDto, 'account'> & {
  account?: string | null
}
