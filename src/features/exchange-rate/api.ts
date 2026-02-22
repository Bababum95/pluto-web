import { apiFetch } from '@/lib/api'
import type { ExchangeRate, ExchangeRateListResponse } from './types'

const BASE = 'rates'

export const exchangeRateApi = {
  list: (): Promise<ExchangeRateListResponse> => apiFetch(BASE),

  getByCode: (code: string): Promise<ExchangeRate> =>
    apiFetch(`${BASE}/code/${code}`),

  getById: (id: string): Promise<ExchangeRate> => apiFetch(`${BASE}/${id}`),
}
