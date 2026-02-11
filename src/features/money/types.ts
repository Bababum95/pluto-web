export type FormatBalanceParams = {
  balance: number
  scale: number
  currency: {
    code: string
    symbol: string
    decimal_digits: number
  }
}
