import Decimal from 'decimal.js'

import type { FeeType } from '../types'

/**
 * Derive missing "to" amount using rate and fee.
 */
export const deriveToAmount = (params: {
  from: Decimal | null
  to: Decimal | null
  rate: Decimal
  fee: Decimal | null
  feeType: FeeType
}): Decimal | null => {
  const { from, to, rate, fee, feeType } = params

  if (to) return to
  if (!from) return null

  let netFrom = from

  if (fee && feeType === 'percent') {
    const percentAmount = netFrom.mul(fee).div(100)
    netFrom = netFrom.sub(percentAmount)
  }

  if (fee && feeType === 'from_currency') {
    netFrom = netFrom.sub(fee)
  }

  let calculatedTo = netFrom.mul(rate)

  if (fee && feeType === 'to_currency') {
    calculatedTo = calculatedTo.sub(fee)
  }

  return calculatedTo
}
