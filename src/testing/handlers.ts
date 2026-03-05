import { authHandlers } from './handlers/auth'
import { accountHandlers } from './handlers/account'
import { categoryHandlers } from './handlers/category'
import { tagHandlers } from './handlers/tag'
import { transactionHandlers } from './handlers/transaction'
import { transferHandlers } from './handlers/transfer'
import { currencyHandlers } from './handlers/currency'
import { exchangeRateHandlers } from './handlers/exchange-rate'
import { settingsHandlers } from './handlers/settings'

export const handlers = [
  ...authHandlers,
  ...accountHandlers,
  ...categoryHandlers,
  ...tagHandlers,
  ...transactionHandlers,
  ...transferHandlers,
  ...currencyHandlers,
  ...exchangeRateHandlers,
  ...settingsHandlers,
]
