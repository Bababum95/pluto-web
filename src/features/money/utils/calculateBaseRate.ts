import { Decimal } from 'decimal.js'

import type { ExchangeRate } from '@/features/exchange-rate/types'

/**
 * Calculate exchange rate between two currencies.
 * All rates must be relative to USD.
 */
export function calculateBaseRate(
  rates: ExchangeRate[],
  from: string,
  to: string
): number | null {
  if (from === to) return 1

  const fromRate = rates.find((r) => r.code === from)
  const toRate = rates.find((r) => r.code === to)

  if (!fromRate || !toRate) return null

  return new Decimal(toRate.value).div(fromRate.value).toNumber()
}
