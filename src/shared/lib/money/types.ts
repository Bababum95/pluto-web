export type {
  MoneyViewCurrencyDto,
  MoneyViewDto,
} from '@/shared/api/generated/model'

export type FormatBalanceParams = {
  balance: number
  currency: {
    code: string
    decimal_digits: number
  }
}
