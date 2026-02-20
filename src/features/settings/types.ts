import type { components } from '@/lib/api/types'

export type Settings = components['schemas']['SettingsDto']

/** Override: generated type has account as Record<string, never>; backend expects string | null (MongoDB ObjectId). */
export type UpdateSettingsDto = Omit<
  components['schemas']['UpdateSettingsDto'],
  'account'
> & {
  account?: string | null
}
