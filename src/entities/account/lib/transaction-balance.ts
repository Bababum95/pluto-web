import { Decimal } from 'decimal.js'

import { convertMoneyAmount } from '@/shared/lib/money/utils/convertMoneyAmount'
import { toDecimal } from '@/shared/lib/money/utils/toDecimal'
import type { RateDto } from '@/entities/exchange-rate'
import type { MoneyViewCurrencyDto, MoneyViewDto } from '@/shared/lib/money/types'
import type {
  AccountDto,
  AccountSummaryDto,
  CurrencyDto,
  TransactionDtoType,
} from '@/shared/api/generated/model'

export function getSignedTransactionAmountRaw(
  type: TransactionDtoType,
  amountRaw: number
): number {
  return type === 'expense' ? -amountRaw : amountRaw
}

/**
 * When live FX conversion is unavailable, keep the default-currency identity and
 * scale the previous converted balance by the same ratio as the original change.
 * Falling back to `original` would hide the default-currency line in the UI.
 */
function preserveConvertedBalance(
  account: AccountDto,
  newOriginal: MoneyViewDto,
  targetCurrency: MoneyViewCurrencyDto
): MoneyViewDto {
  const previousConverted = account.balance.converted
  const effectiveTarget =
    targetCurrency.code !== newOriginal.currency.code
      ? targetCurrency
      : previousConverted.currency.code !== newOriginal.currency.code
        ? previousConverted.currency
        : null

  if (!effectiveTarget) {
    return newOriginal
  }

  const previousOriginalValue = account.balance.original.value
  const scale = effectiveTarget.decimal_digits

  if (previousOriginalValue === 0) {
    return {
      currency: effectiveTarget,
      scale,
      raw: 0,
      value: 0,
    }
  }

  const impliedRate = new Decimal(previousConverted.value).div(
    previousOriginalValue
  )
  const newConvertedValue = new Decimal(newOriginal.value).mul(impliedRate)
  const raw = newConvertedValue
    .mul(new Decimal(10).pow(scale))
    .toDecimalPlaces(0, Decimal.ROUND_HALF_UP)
    .toNumber()

  return {
    currency: effectiveTarget,
    scale,
    raw,
    value: toDecimal(raw, scale),
  }
}

export function resolveConvertedAccountBalance(
  account: AccountDto,
  newOriginal: MoneyViewDto,
  rates: RateDto[],
  targetCurrency: MoneyViewCurrencyDto
): MoneyViewDto {
  return (
    convertMoneyAmount({
      amountRaw: newOriginal.raw,
      scale: newOriginal.scale,
      sourceCurrency: newOriginal.currency,
      targetCurrency,
      rates,
    }) ?? preserveConvertedBalance(account, newOriginal, targetCurrency)
  )
}

export function applyTransactionDeltaToAccount(
  account: AccountDto,
  signedDeltaRaw: number,
  rates: RateDto[],
  targetCurrency: MoneyViewCurrencyDto
): AccountDto {
  const originalRaw = account.balance.original.raw + signedDeltaRaw
  const { scale } = account.balance.original

  const original = {
    ...account.balance.original,
    raw: originalRaw,
    value: toDecimal(originalRaw, scale),
  }

  const converted = resolveConvertedAccountBalance(
    account,
    original,
    rates,
    targetCurrency
  )

  return {
    ...account,
    balance: { original, converted },
    updatedAt: new Date().toISOString(),
  }
}

export function calculateAccountsSummary(
  accounts: AccountDto[],
  rates: RateDto[],
  targetCurrency: MoneyViewCurrencyDto,
  summaryCurrency: CurrencyDto
): AccountSummaryDto {
  let totalRaw = 0

  for (const account of accounts) {
    if (account.excluded) continue

    const converted = convertMoneyAmount({
      amountRaw: account.balance.original.raw,
      scale: account.balance.original.scale,
      sourceCurrency: account.balance.original.currency,
      targetCurrency,
      rates,
    })

    if (converted) {
      totalRaw += converted.raw
      continue
    }

    // Prefer the stored converted balance when it is already in the target currency
    // (e.g. after an optimistic update that preserved default-currency identity).
    if (account.balance.converted.currency.code === targetCurrency.code) {
      totalRaw += account.balance.converted.raw
    }
  }

  const scale = targetCurrency.decimal_digits

  return {
    total_raw: totalRaw,
    total: toDecimal(totalRaw, scale),
    scale,
    currency: summaryCurrency,
  }
}
