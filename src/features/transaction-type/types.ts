import type { TRANSACTION_TYPES } from './constants'

export type TransactionType = (typeof TRANSACTION_TYPES)[number]
