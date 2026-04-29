import type { CurrencyDto } from '@/features/currency/types'

export const mockCurrency: CurrencyDto = {
  id: 'currency-1',
  code: 'USD',
  symbol: '$',
  name: 'US Dollar',
  symbol_native: '$',
  decimal_digits: 2,
  rounding: 0,
  name_plural: 'US dollars',
  type: 'fiat',
}

export function createMockCurrency(
  overrides?: Partial<CurrencyDto>
): CurrencyDto {
  return { ...mockCurrency, ...overrides }
}
