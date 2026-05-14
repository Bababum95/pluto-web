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
}: Params): TransactionDto {
  const now = new Date().toISOString()
  const divisor = 10 ** scale
  const value = amountRaw / divisor
  const originalCurrency = account.balance.original.currency
  const convertedCurrency = account.balance.converted.currency

  const original = {
    value,
    raw: amountRaw,
    scale,
    currency: originalCurrency,
  }

  const converted = {
    value,
    raw: amountRaw,
    scale,
    currency: convertedCurrency,
  }

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
