import { Decimal } from 'decimal.js'

/**
 * Rescale a minor-unit amount between decimal scales without changing its value.
 * e.g. raw=100, fromScale=0, toScale=2 → 10000 (both represent 100.00).
 */
export function normalizeMoneyRaw(
  raw: number,
  fromScale: number,
  toScale: number
): number {
  if (fromScale === toScale) {
    return raw
  }

  const value = new Decimal(raw).div(new Decimal(10).pow(fromScale))
  return value
    .mul(new Decimal(10).pow(toScale))
    .toDecimalPlaces(0, Decimal.ROUND_HALF_UP)
    .toNumber()
}
