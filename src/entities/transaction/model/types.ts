import type { TransactionDto } from '@/features/transaction/types'
import type { Status } from '@/lib/types'

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
