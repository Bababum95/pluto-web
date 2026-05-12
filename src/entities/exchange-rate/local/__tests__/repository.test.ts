import { describe, it, expect, beforeEach, vi } from 'vitest'
import { exchangeRateRepository } from '../repository'
import { db } from '@/lib/local/db'
import type { RateDto } from '@/entities/exchange-rate'

vi.mock('@/lib/local/config', () => ({
  LOCAL_DATA_MODE: 'dexie',
}))

describe('exchangeRateRepository', () => {
  beforeEach(async () => {
    await db.exchangeRates.clear()
  })

  const createMockRate = (overrides?: Partial<RateDto>): RateDto => ({
    id: 'rate-1',
    code: 'USD_EUR',
    value: 0.85,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  })

  describe('getAll', () => {
    it('should return empty array when no rates exist', async () => {
      const result = await exchangeRateRepository.getAll()
      expect(result).toEqual([])
    })

    it('should return all rates', async () => {
      const rates = [
        createMockRate({ id: 'rate-1', code: 'USD_EUR', value: 0.85 }),
        createMockRate({ id: 'rate-2', code: 'USD_GBP', value: 0.73 }),
      ]

      await exchangeRateRepository.saveMany(rates)

      const result = await exchangeRateRepository.getAll()
      expect(result).toHaveLength(2)
      expect(result).toEqual(expect.arrayContaining(rates))
    })
  })

  describe('saveMany', () => {
    it('should save multiple rates', async () => {
      const rates = [
        createMockRate({ id: 'rate-1', code: 'USD_EUR' }),
        createMockRate({ id: 'rate-2', code: 'USD_GBP' }),
      ]

      await exchangeRateRepository.saveMany(rates)

      const result = await exchangeRateRepository.getAll()
      expect(result).toHaveLength(2)
    })

    it('should update existing rates', async () => {
      const rate1 = createMockRate({ id: 'rate-1', value: 0.85 })
      const rate2 = createMockRate({ id: 'rate-1', value: 0.9 })

      await exchangeRateRepository.saveMany([rate1])
      await exchangeRateRepository.saveMany([rate2])

      const result = await exchangeRateRepository.getAll()
      expect(result).toHaveLength(1)
      expect(result[0].value).toBe(0.9)
    })

    it('should not set isDirty flag (read-only entity)', async () => {
      const rate = createMockRate()
      await exchangeRateRepository.saveMany([rate])

      const row = await db.exchangeRates.get('rate-1')
      // ExchangeRateRow doesn't have isDirty field (read-only entity)
      expect(row).toBeDefined()
      expect(row?.syncedAt).toBeDefined()
    })
  })

  describe('syncFromApi', () => {
    it('should save rates from API', async () => {
      const rates = [
        createMockRate({ id: 'rate-1', code: 'USD_EUR' }),
        createMockRate({ id: 'rate-2', code: 'USD_GBP' }),
      ]

      await exchangeRateRepository.syncFromApi(rates)

      const result = await exchangeRateRepository.getAll()
      expect(result).toHaveLength(2)
      expect(result).toEqual(expect.arrayContaining(rates))
    })

    it('should overwrite existing rates (no dirty check for read-only)', async () => {
      const oldRate = createMockRate({ id: 'rate-1', value: 0.85 })
      const newRate = createMockRate({ id: 'rate-1', value: 0.9 })

      await exchangeRateRepository.saveMany([oldRate])
      await exchangeRateRepository.syncFromApi([newRate])

      const result = await exchangeRateRepository.getAll()
      expect(result).toHaveLength(1)
      expect(result[0].value).toBe(0.9)
    })
  })

  describe('clear', () => {
    it('should clear all rates', async () => {
      const rates = [
        createMockRate({ id: 'rate-1' }),
        createMockRate({ id: 'rate-2' }),
      ]

      await exchangeRateRepository.saveMany(rates)
      await exchangeRateRepository.clear()

      const result = await exchangeRateRepository.getAll()
      expect(result).toEqual([])
    })
  })
})
