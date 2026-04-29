export type {
  MoneyViewCurrencyDto,
  MoneyViewDto,
} from '@/lib/api/generated/model'

export type FormatBalanceParams = {
  balance: number
  currency: {
    code: string
    decimal_digits: number
  }
}
