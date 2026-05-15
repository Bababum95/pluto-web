import { Decimal } from 'decimal.js'

import type { RateDto } from '@/entities/exchange-rate'
import type {
  MoneyViewCurrencyDto,
  MoneyViewDto,
} from '@/shared/lib/money/types'

type ConvertMoneyAmountParams = {
  amountRaw: number
  scale: number
  sourceCurrency: MoneyViewCurrencyDto
  targetCurrency: MoneyViewCurrencyDto
  rates: RateDto[]
}

function toUSD(
  amountDecimal: Decimal,
  sourceCode: string,
  rates: RateDto[]
): Decimal | null {
  if (sourceCode === 'USD') {
    return amountDecimal
  }
  if (rates.length === 0) {
    return null
  }

  const sourceRate = rates.find((r) => r.code === sourceCode)
  if (!sourceRate) {
    return null
  }

  return amountDecimal.div(new Decimal(sourceRate.value))
}

function fromUSD(
  amountInUSD: Decimal,
  targetCurrency: MoneyViewCurrencyDto,
  rates: RateDto[]
): Decimal | null {
  if (targetCurrency.code === 'USD') {
    return amountInUSD
  }
  if (rates.length === 0) {
    return null
  }

  const targetRate = rates.find((r) => r.code === targetCurrency.code)
  if (!targetRate) {
    return null
  }

  return amountInUSD.mul(new Decimal(targetRate.value))
}

function minorUnitsFromDecimal(
  amount: Decimal,
  scale: number
): Pick<MoneyViewDto, 'value' | 'raw' | 'scale'> {
  const rounded = amount.toDecimalPlaces(scale, Decimal.ROUND_HALF_UP)
  const rawMinor = rounded.mul(new Decimal(10).pow(scale)).toNumber()

  return {
    value: rounded.toNumber(),
    raw: rawMinor,
    scale,
  }
}

/**
 * Converts a minor-unit amount from source to target currency via USD rates
 * (rate = units per 1 USD), matching API MoneyService.convertAmount.
 */
export function convertMoneyAmount({
  amountRaw,
  scale,
  sourceCurrency,
  targetCurrency,
  rates,
}: ConvertMoneyAmountParams): MoneyViewDto | null {
  const amountDecimal = new Decimal(amountRaw).div(new Decimal(10).pow(scale))

  if (sourceCurrency.code === targetCurrency.code) {
    const same = minorUnitsFromDecimal(amountDecimal, scale)
    return { ...same, currency: sourceCurrency }
  }

  const amountInUSD = toUSD(amountDecimal, sourceCurrency.code, rates)
  if (!amountInUSD) {
    return null
  }

  const amountInTarget = fromUSD(amountInUSD, targetCurrency, rates)
  if (!amountInTarget) {
    return null
  }

  const targetScale = targetCurrency.decimal_digits
  const converted = minorUnitsFromDecimal(amountInTarget, targetScale)

  return {
    ...converted,
    currency: targetCurrency,
  }
}
