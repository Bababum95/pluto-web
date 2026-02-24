import type { components } from '@/lib/api/types'

export type TransferSideDto = components['schemas']['TransferSideDto']
export type CreateTransferDto = components['schemas']['CreateTransferDto']
export type UpdateTransferDto = components['schemas']['UpdateTransferDto']
export type Transfer = components['schemas']['TransferDto']
export type FeeDto = components['schemas']['FeeDto']

export type FeeType = 'percent' | 'from_currency' | 'to_currency'

export type TransferFormValues = {
  fromAccount: string
  toAccount: string
  fromAmount: string
  toAmount: string
  rate: string
  fee: string
  feeType: FeeType
}
