import type { ExchangeRate } from '@/features/exchange-rate/types'

export const mockExchangeRate: ExchangeRate = {
  id: 'rate-1',
  code: 'USD',
  value: 1,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

export function createMockExchangeRate(
  overrides?: Partial<ExchangeRate>
): ExchangeRate {
  return { ...mockExchangeRate, ...overrides }
}
