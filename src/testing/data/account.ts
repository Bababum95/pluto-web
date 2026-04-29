import type {
  AccountDto,
  AccountListResponseDto,
  AccountSummaryDto,
  AccountWithSummaryResponseDto,
} from '@/features/account/types'
import { mockCurrency } from './currency'

const moneyViewCurrency = {
  id: mockCurrency.id,
  code: mockCurrency.code,
  symbol: mockCurrency.symbol,
  decimal_digits: mockCurrency.decimal_digits,
}

const moneyView = {
  value: 1000,
  raw: 100000,
  scale: 2,
  currency: moneyViewCurrency,
}

export const mockAccount: AccountDto = {
  id: 'account-1',
  color: '#3B82F6',
  icon: 'wallet',
  name: 'Main Wallet',
  description: 'Personal spending',
  balance: {
    original: moneyView,
    converted: moneyView,
  },
  order: 1,
  excluded: false,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

export const mockAccountSummary: AccountSummaryDto = {
  total_raw: 100000,
  scale: 2,
  total: 1000,
  currency: mockCurrency,
}

export const mockAccountListResponse: AccountListResponseDto = {
  list: [mockAccount],
  summary: mockAccountSummary,
}

export const mockAccountWithSummaryResponse: AccountWithSummaryResponseDto = {
  account: mockAccount,
  summary: mockAccountSummary,
}

export function createMockAccount(overrides?: Partial<AccountDto>): AccountDto {
  return { ...mockAccount, ...overrides }
}
