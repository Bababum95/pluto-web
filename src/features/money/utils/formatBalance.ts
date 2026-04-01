import type { FormatBalanceParams } from '../types'

export function formatBalance({
  balance,
  currency,
}: FormatBalanceParams): string {
  const minFraction = balance < 100 ? 2 : 0

  try {
    // Try native currency formatting (ISO 4217 only)
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits: minFraction,
      maximumFractionDigits: currency.decimal_digits,
    }).format(balance)
  } catch {
    // Fallback for crypto or unsupported currency codes (e.g. USDT, BTC)
    return (
      new Intl.NumberFormat('ru-RU', {
        style: 'decimal',
        minimumFractionDigits: minFraction,
        maximumFractionDigits: currency.decimal_digits,
      }).format(balance) + ` ${currency.code}`
    )
  }
}
