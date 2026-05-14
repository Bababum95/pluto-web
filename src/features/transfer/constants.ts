import type { TransferFormValues } from '@/entities/transfer'

export const DEFAULT_TRANSFER_FORM_VALUES: TransferFormValues = {
  fromAccount: '',
  toAccount: '',
  fromAmount: '',
  toAmount: '',
  rate: '',
  fee: '',
  feeType: 'percent',
}
