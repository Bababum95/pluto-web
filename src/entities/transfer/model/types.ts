import type { TransferDto } from './dto-types'
import type { Status } from '@/lib/types'

export type TransferState = {
  transfers: TransferDto[]
  status: Status
}
