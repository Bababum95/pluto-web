import dayjs from '@/lib/dayjs'

import type { TransactionFormType } from './types'

export const DEFAULT_TRANSACTION_FORM_VALUES: TransactionFormType = {
  amount: '',
  account: '',
  comment: '',
  category: '',
  tags: [],
  date: dayjs().toDate(),
}
