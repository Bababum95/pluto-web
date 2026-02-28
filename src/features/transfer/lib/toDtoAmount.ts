import type Decimal from 'decimal.js'

/**
 * Convert Decimal to DTO amount format.
 */
export const toDtoAmount = (amount: Decimal) => {
  const scale = amount.decimalPlaces()
  const normalized = amount.toFixed(scale)
  const value = normalized.replace('.', '')

  return { value: Number(value), scale }
}
