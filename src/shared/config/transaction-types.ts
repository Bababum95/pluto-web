export const TRANSACTION_TYPES = ['expense', 'income'] as const
export const DEFAULT_TRANSACTION_TYPE = 'expense'

export type TransactionType = (typeof TRANSACTION_TYPES)[number]
