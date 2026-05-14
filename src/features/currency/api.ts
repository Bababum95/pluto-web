import {
  currencyControllerFindAll,
  currencyControllerFindOne,
} from '@/shared/api/generated/currencies/currencies'
import type { CurrencyDto } from './model/types'

export const currencyApi = {
  list: (): Promise<CurrencyDto[]> => currencyControllerFindAll(),

  getById: (id: string): Promise<CurrencyDto> => currencyControllerFindOne(id),
}
