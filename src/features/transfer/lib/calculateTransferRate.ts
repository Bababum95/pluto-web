import Decimal from 'decimal.js'

import { calculateBaseRate } from '@/features/money'
import type { ExchangeRate } from '@/features/exchange-rate'

import type { FeeType } from '../types'

type Value = Decimal | null
type Money = {
  value: Value
  code: string
}

type Params = {
  from: Money
  to: Money
  fee: {
    value?: Value
    type: FeeType
  }
  rates: ExchangeRate[]
}

export function calculateTransferRate({
  from,
  to,
  fee,
  rates,
}: Params): Decimal | null {
  // If one of amounts is missing — fallback to base exchange rate
  if (!from.value || !to.value) {
    const baseRate = calculateBaseRate(rates, from.code, to.code)
    return baseRate ? new Decimal(baseRate) : null
  }

  let netFrom = from.value
  let netTo = to.value

  if (fee.value && fee.value.gt(0)) {
    const feeDecimal = fee.value

    if (fee.type === 'percent') {
      // netFrom = from - (from * percent / 100)
      const percentAmount = netFrom.mul(feeDecimal).div(100)
      netFrom = netFrom.sub(percentAmount)
    }

    if (fee.type === 'from_currency') {
      netFrom = netFrom.sub(feeDecimal)
    }

    if (fee.type === 'to_currency') {
      netTo = netTo.add(feeDecimal)
    }
  }

  if (netFrom.isZero()) return null

  return netTo.div(netFrom)
}
