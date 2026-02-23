import type { Transfer } from '@/features/transfer/types'
import type { Status } from '@/lib/types'

export type TransferState = {
  transfers: Transfer[]
  status: Status
}
