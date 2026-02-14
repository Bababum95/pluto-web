import { Decimal } from 'decimal.js'

export function toDecimalString(balance: number, scale: number): string {
  return new Decimal(balance).div(new Decimal(10).pow(scale)).toFixed(scale)
}

export function toDecimal(balance: number, scale: number): number {
  return new Decimal(balance).div(new Decimal(10).pow(scale)).toNumber()
}
