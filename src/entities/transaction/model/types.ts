import type { TransactionDto } from './dto-types'
import type { Status } from '@/shared/lib/async-status'

export type TransactionState = {
  transactions: TransactionDto[]
  status: Status
  current: TransactionDto | null
  summary: {
    total: number
    total_raw: number
    scale: number
    currency: {
      code: string
      symbol: string
      decimal_digits: number
    }
  } | null
}
