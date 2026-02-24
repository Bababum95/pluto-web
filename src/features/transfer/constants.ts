import type { TransferFormValues } from './types'

export const DEFAULT_TRANSFER_FORM_VALUES: TransferFormValues = {
  fromAccount: '',
  toAccount: '',
  fromAmount: '',
  toAmount: '',
  rate: '1',
  fee: '0',
  feeType: 'percent',
}
