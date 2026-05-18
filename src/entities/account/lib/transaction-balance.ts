import { convertMoneyAmount } from '@/shared/lib/money/utils/convertMoneyAmount'
import { toDecimal } from '@/shared/lib/money/utils/toDecimal'
import type { RateDto } from '@/entities/exchange-rate'
import type { MoneyViewCurrencyDto } from '@/shared/lib/money/types'
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

export function applyTransactionDeltaToAccount(
  account: AccountDto,
  signedDeltaRaw: number,
  rates: RateDto[],
  targetCurrency: MoneyViewCurrencyDto
): AccountDto {
  const originalRaw = account.balance.original.raw + signedDeltaRaw
  const { scale, currency } = account.balance.original

  const original = {
    ...account.balance.original,
    raw: originalRaw,
    value: toDecimal(originalRaw, scale),
  }

  const converted =
    convertMoneyAmount({
      amountRaw: originalRaw,
      scale,
      sourceCurrency: currency,
      targetCurrency,
      rates,
    }) ?? original

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
