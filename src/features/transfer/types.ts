export type {
  CreateTransferDto,
  FeeDto,
  TransferControllerFindAllParams,
  TransferDto,
  TransferSideDto,
  UpdateTransferDto,
} from '@/lib/api/generated/model'

export type FeeType = 'percent' | 'from_currency' | 'to_currency'

export type TransferFormValues = {
  fromAccount: string
  toAccount: string
  fromAmount?: string | null
  toAmount?: string | null
  rate?: string | null
  fee?: string | null
  feeType: FeeType
}
