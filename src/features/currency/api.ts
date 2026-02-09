import { apiFetch } from '@/lib/api'
import type { Currency } from './types'

const BASE = 'currencies'

export const currencyApi = {
  list: (): Promise<Currency[]> => apiFetch(BASE),

  getById: (id: string): Promise<Currency> => apiFetch(`${BASE}/${id}`),
}
