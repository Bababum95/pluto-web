import { describe, it, expect, beforeEach, vi } from 'vitest'
import { settingsRepository } from '../repository'
import { db } from '@/shared/lib/local-storage/db'
import type { SettingsDto } from '@/entities/settings'
import type { CurrencyDto } from '@/shared/api/generated/model'

vi.mock('@/shared/lib/local-storage/config', () => ({
  LOCAL_DATA_MODE: 'dexie',
}))

const createMockCurrency = (code: string, symbol: string): CurrencyDto => ({
  id: `currency-${code}`,
  code,
  symbol,
  name: code,
  symbol_native: symbol,
  decimal_digits: 2,
  rounding: 0,
  name_plural: `${code}s`,
  type: 'fiat',
})

describe('settingsRepository', () => {
  beforeEach(async () => {
    await db.settings.clear()
  })

  describe('get', () => {
    it('should return null when no settings exist', async () => {
      const result = await settingsRepository.get()
      expect(result).toBeNull()
    })

    it('should return settings when they exist', async () => {
      const mockSettings: SettingsDto = {
        id: 'settings-1',
        account: null,
        currency: createMockCurrency('USD', '$'),
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      }

      await settingsRepository.save(mockSettings)

      const result = await settingsRepository.get()
      expect(result).toEqual(mockSettings)
    })
  })

  describe('save', () => {
    it('should save settings to database', async () => {
      const mockSettings: SettingsDto = {
        id: 'settings-1',
        account: null,
        currency: createMockCurrency('USD', '$'),
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      }

      await settingsRepository.save(mockSettings)

      const row = await db.settings.get('current')
      expect(row).toBeDefined()
      expect(row?.payload).toEqual(mockSettings)
      expect(row?.syncedAt).toBeDefined()
    })

    it('should update existing settings', async () => {
      const mockSettings1: SettingsDto = {
        id: 'settings-1',
        account: null,
        currency: createMockCurrency('USD', '$'),
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      }

      const mockSettings2: SettingsDto = {
        id: 'settings-2',
        account: { id: 'acc-1', name: 'Account 1' } as SettingsDto['account'],
        currency: createMockCurrency('EUR', '€'),
        createdAt: '2024-01-02T00:00:00.000Z',
        updatedAt: '2024-01-02T00:00:00.000Z',
      }

      await settingsRepository.save(mockSettings1)
      await settingsRepository.save(mockSettings2)

      const result = await settingsRepository.get()
      expect(result).toEqual(mockSettings2)

      const count = await db.settings.count()
      expect(count).toBe(1) // Should only have one settings record
    })
  })

  describe('syncFromApi', () => {
    it('should save settings from API', async () => {
      const mockSettings: SettingsDto = {
        id: 'settings-1',
        account: null,
        currency: createMockCurrency('USD', '$'),
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      }

      await settingsRepository.syncFromApi(mockSettings)

      const result = await settingsRepository.get()
      expect(result).toEqual(mockSettings)
    })
  })

  describe('clear', () => {
    it('should clear all settings', async () => {
      const mockSettings: SettingsDto = {
        id: 'settings-1',
        account: null,
        currency: createMockCurrency('USD', '$'),
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      }

      await settingsRepository.save(mockSettings)
      await settingsRepository.clear()

      const result = await settingsRepository.get()
      expect(result).toBeNull()
    })
  })
})
