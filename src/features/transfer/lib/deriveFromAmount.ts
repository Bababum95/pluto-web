import Decimal from 'decimal.js'

import type { FeeType } from '../types'

/**
 * Derive missing "from" amount using rate and fee.
 */
export const deriveFromAmount = (params: {
  from: Decimal | null
  to: Decimal | null
  rate: Decimal
  fee: Decimal | null
  feeType: FeeType
}): Decimal | null => {
  const { from, to, rate, fee, feeType } = params

  if (from) return from
  if (!to) return null

  let netTo = to

  if (fee && feeType === 'to_currency') {
    netTo = netTo.add(fee)
  }

  const baseFrom = netTo.div(rate)

  if (fee && feeType === 'from_currency') {
    return baseFrom.add(fee)
  }

  if (fee && feeType === 'percent') {
    const percentFactor = new Decimal(1).sub(fee.div(100))
    return baseFrom.div(percentFactor)
  }

  return baseFrom
}
