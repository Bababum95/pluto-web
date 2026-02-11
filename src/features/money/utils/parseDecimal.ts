export type ParseDecimalResult = {
  balance: number
  scale: number
}

export function parseDecimal(value: string): ParseDecimalResult {
  const parts = value.split('.')
  const scale = parts[1]?.length ?? 0
  const balance = Number(parts.join(''))

  return { balance, scale }
}
