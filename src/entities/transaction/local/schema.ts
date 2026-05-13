import type {
  TransactionDto,
  TransactionDtoType,
} from '@/lib/api/generated/model'

/** IndexedDB row for the Dexie `transactions` table (denormalized fields for indexing). */
export type TransactionRow = {
  id: string
  payload: TransactionDto
  updatedAt: string
  syncedAt?: string
  isDirty?: boolean
  accountId: string
  date: string
  type: TransactionDtoType
}

export function transactionRowFromDto(
  dto: TransactionDto,
  updatedAt: string = new Date().toISOString()
): TransactionRow {
  return {
    id: dto.id,
    payload: dto,
    updatedAt,
    accountId: dto.account.id,
    date: dto.date,
    type: dto.type,
  }
}

export function transactionDtoFromRow(row: TransactionRow): TransactionDto {
  return row.payload
}
