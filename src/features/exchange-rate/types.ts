export type ExchangeRate = {
  id: string
  baseCurrency: string
  targetCurrency: string
  rate: number
  updatedAt: string
}

export type ExchangeRateListResponse = ExchangeRate[]
