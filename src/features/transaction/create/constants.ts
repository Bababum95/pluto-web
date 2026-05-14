import dayjs from '@/shared/lib/date/dayjs'
import type { TransactionFormType } from '@/entities/transaction'

export const DEFAULT_TRANSACTION_FORM_VALUES: TransactionFormType = {
  amount: '',
  account: '',
  comment: '',
  category: '',
  tags: [],
  date: dayjs().toDate(),
}
