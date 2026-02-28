import Decimal from 'decimal.js'

import type { FeeType } from '../types'

/**
 * Normalize fee to from_currency format.
 */
export const normalizeFeeToFrom = (
  fee: Decimal,
  from: Decimal,
  rate: Decimal,
  feeType: FeeType
): Decimal => {
  if (feeType === 'percent') {
    return from.mul(fee).div(100)
  }

  if (feeType === 'to_currency') {
    return fee.div(rate)
  }

  return fee
}
