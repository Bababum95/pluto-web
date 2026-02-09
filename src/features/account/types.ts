import type { components } from '@/lib/api/types'

export type Account = components['schemas']['AccountDto']

export type CreateAccountDto = components['schemas']['CreateAccountDto']
export type UpdateAccountDto = Partial<CreateAccountDto>
