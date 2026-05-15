import { convertMoneyAmount } from '@/shared/lib/money/utils/convertMoneyAmount'
import { toDecimal } from '@/shared/lib/money/utils/toDecimal'
import type { RateDto } from '@/entities/exchange-rate'
import type { MoneyViewCurrencyDto } from '@/shared/lib/money/types'
import type {
  AccountDto,
  CategoryDto,
  TagDto,
  TransactionDto,
  TransactionDtoType,
} from '@/shared/api/generated/model'

type Params = {
  id: string
  account: AccountDto
  category: CategoryDto
  tags: TagDto[]
  type: TransactionDtoType
  comment?: string
  amountRaw: number
  scale: number
  date: string
  rates: RateDto[]
  targetCurrency: MoneyViewCurrencyDto
}

/**
 * Builds an optimistic TransactionDto for offline-first creates before the API responds.
 */
export function buildPlaceholderTransaction({
  id,
  account,
  category,
  tags,
  type,
  comment = '',
  amountRaw,
  scale,
  date,
  rates,
  targetCurrency,
}: Params): TransactionDto {
  const now = new Date().toISOString()
  const sourceCurrency = account.balance.original.currency

  const original = {
    value: toDecimal(amountRaw, scale),
    raw: amountRaw,
    scale,
    currency: sourceCurrency,
  }

  const converted =
    convertMoneyAmount({
      amountRaw,
      scale,
      sourceCurrency,
      targetCurrency,
      rates,
    }) ?? original

  return {
    id,
    account,
    type,
    category,
    comment,
    tags,
    date,
    createdAt: now,
    updatedAt: now,
    amount: {
      original,
      converted,
    },
  }
}
