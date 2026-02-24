import { Decimal } from 'decimal.js'

import type { FeeType } from '../types'

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP })

function safeDec(value: string | undefined): Decimal {
  try {
    const v = value?.trim()
    if (!v || v === '' || v === '.') return new Decimal(0)
    return new Decimal(v)
  } catch {
    return new Decimal(0)
  }
}

export function computeToAmount(
  fromAmount: string,
  rate: string,
  fee: string,
  feeType: FeeType,
  decimalDigits?: number
): string {
  const from = safeDec(fromAmount)
  const r = safeDec(rate)
  const f = safeDec(fee)

  if (from.isZero() || r.isZero()) return ''

  let result: Decimal

  switch (feeType) {
    case 'percent':
      result = from.mul(r).mul(new Decimal(1).minus(f.div(100)))
      break
    case 'from_currency':
      result = from.minus(f).mul(r)
      break
    case 'to_currency':
      result = from.mul(r).minus(f)
      break
  }

  if (result.isNegative()) return '0'

  const dp = decimalDigits ?? 8
  const fixed = result.toDecimalPlaces(dp).toString()
  return fixed
}

export function computeFromAmount(
  toAmount: string,
  rate: string,
  fee: string,
  feeType: FeeType,
  decimalDigits?: number
): string {
  const to = safeDec(toAmount)
  const r = safeDec(rate)
  const f = safeDec(fee)

  if (to.isZero() || r.isZero()) return ''

  let result: Decimal

  switch (feeType) {
    case 'percent': {
      const factor = r.mul(new Decimal(1).minus(f.div(100)))
      if (factor.isZero()) return ''
      result = to.div(factor)
      break
    }
    case 'from_currency': {
      result = to.div(r).plus(f)
      break
    }
    case 'to_currency': {
      result = to.plus(f).div(r)
      break
    }
  }

  if (result.isNegative()) return '0'

  const dp = decimalDigits ?? 8
  const fixed = result.toDecimalPlaces(dp).toString()
  return fixed
}

export function computeRate(
  fromCurrencyCode: string | undefined,
  toCurrencyCode: string | undefined,
  rates: Array<{ code: string; value: number }>
): string | null {
  if (!fromCurrencyCode || !toCurrencyCode) return null
  if (fromCurrencyCode === toCurrencyCode) return '1'

  const fromRate = rates.find((r) => r.code === fromCurrencyCode)
  const toRate = rates.find((r) => r.code === toCurrencyCode)

  if (!fromRate || !toRate || fromRate.value === 0) return null

  const result = new Decimal(toRate.value).div(new Decimal(fromRate.value))
  return result.toDecimalPlaces(8).toString()
}
