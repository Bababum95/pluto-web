import type { components } from '@/lib/api/types'

export type Account = components['schemas']['AccountDto']
export type AccountSummaryDto = components['schemas']['AccountSummaryDto']
export type AccountListResponseDto = {
  list: Account[]
  summary: AccountSummaryDto
}
export type CreateAccountDto = components['schemas']['CreateAccountDto']
export type UpdateAccountDto = Partial<CreateAccountDto>
export type AccountFormValues = Omit<CreateAccountDto, 'balance' | 'scale'> & {
  balance: string
}
