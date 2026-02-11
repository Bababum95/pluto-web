import type { FormatBalanceParams } from '../types'

export function formatBalance({
  balance,
  scale,
  currency,
}: FormatBalanceParams): string {
  const value = balance / 10 ** scale

  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: currency.code,
    minimumFractionDigits: currency.decimal_digits,
    maximumFractionDigits: currency.decimal_digits,
  }).format(value)
}
