import type { TransferDto } from '@/features/transfer/types'
import type { Status } from '@/lib/types'

export type TransferState = {
  transfers: TransferDto[]
  status: Status
}
