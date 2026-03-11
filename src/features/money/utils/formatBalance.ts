import type { FormatBalanceParams } from '../types'

export function formatBalance({
  balance,
  currency,
}: FormatBalanceParams): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: currency.code,
    minimumFractionDigits: balance < 100 ? 2 : 0,
    maximumFractionDigits: currency.decimal_digits,
  }).format(balance)
}
