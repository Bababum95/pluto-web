import type { SettingsDto } from '@/features/settings/types'
import { mockAccount } from './account'
import { mockCurrency } from './currency'

export const mockSettings: SettingsDto = {
  id: 'settings-1',
  currency: mockCurrency,
  account: mockAccount,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

export function createMockSettings(
  overrides?: Partial<SettingsDto>
): SettingsDto {
  return { ...mockSettings, ...overrides }
}
