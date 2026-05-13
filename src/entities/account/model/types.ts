import type {
  AccountDto,
  AccountSummaryDto,
  CreateAccountDto,
} from '@/lib/api/generated/model'

export type AccountListResponseDto = {
  list: AccountDto[]
  summary: AccountSummaryDto
}

export type AccountWithSummaryResponseDto = {
  account: AccountDto
  summary: AccountSummaryDto
}
export type UpdateAccountDto = Partial<CreateAccountDto>
export type AccountFormValues = Omit<CreateAccountDto, 'balance' | 'scale'> & {
  balance: string
}

export type { AccountSummaryDto, CreateAccountDto, AccountDto }
