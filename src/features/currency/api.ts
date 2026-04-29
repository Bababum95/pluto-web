import {
  currencyControllerFindAll,
  currencyControllerFindOne,
} from '@/lib/api/generated/currencies/currencies'
import type { CurrencyDto } from './types'

export const currencyApi = {
  list: (): Promise<CurrencyDto[]> => currencyControllerFindAll(),

  getById: (id: string): Promise<CurrencyDto> => currencyControllerFindOne(id),
}
