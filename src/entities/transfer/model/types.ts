import type { TransferDto } from './dto-types'
import type { Status } from '@/shared/lib/async-status'

export type TransferState = {
  transfers: TransferDto[]
  status: Status
}
