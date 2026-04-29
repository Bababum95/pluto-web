import {
  rateControllerFindAll,
  rateControllerFindByCode,
  rateControllerFindOne,
} from '@/lib/api/generated/rates/rates'
import type { RateDto } from './types'

export const exchangeRateApi = {
  list: (): Promise<RateDto[]> => rateControllerFindAll(),

  getByCode: (code: string): Promise<RateDto> => rateControllerFindByCode(code),

  getById: (id: string): Promise<RateDto> => rateControllerFindOne(id),
}
