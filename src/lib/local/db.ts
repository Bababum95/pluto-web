import Dexie, { type EntityTable } from 'dexie'

import type { UserRow } from '@/entities/user/local/schema'
import type { SettingsRow } from '@/entities/settings/local/schema'
import type { TagRow } from '@/entities/tag/local/schema'
import type { CategoryRow } from '@/entities/category/local/schema'
import type { AccountRow } from '@/entities/account/local/schema'
import type { ExchangeRateRow } from '@/entities/exchange-rate/local/schema'
import type { TransactionRow } from '@/entities/transaction/local/schema'
import type { TransferRow } from '@/entities/transfer/local/schema'

import type { SessionRow } from './session'
import type { OutboxRow } from './outbox'

class LocalDb extends Dexie {
  users!: EntityTable<UserRow, 'id'>
  settings!: EntityTable<SettingsRow, 'id'>
  tags!: EntityTable<TagRow, 'id'>
  categories!: EntityTable<CategoryRow, 'id'>
  accounts!: EntityTable<AccountRow, 'id'>
  exchangeRates!: EntityTable<ExchangeRateRow, 'id'>
  transactions!: EntityTable<TransactionRow, 'id'>
  transfers!: EntityTable<TransferRow, 'id'>
  session!: EntityTable<SessionRow, 'id'>
  outbox!: EntityTable<OutboxRow, 'id'>

  constructor() {
    super('pluto')

    this.version(1).stores({
      users: 'id, updatedAt',
      session: 'id',
      outbox: 'id, status, entity, createdAt',
    })

    // Version 2: add settings and tags
    this.version(2).stores({
      users: 'id, updatedAt',
      settings: 'id',
      tags: 'id, updatedAt',
      session: 'id',
      outbox: 'id, status, entity, createdAt',
    })

    // Version 3: add categories
    this.version(3).stores({
      users: 'id, updatedAt',
      settings: 'id',
      tags: 'id, updatedAt',
      categories: 'id, updatedAt',
      session: 'id',
      outbox: 'id, status, entity, createdAt',
    })

    // Version 4: add accounts and exchangeRates
    this.version(4).stores({
      users: 'id, updatedAt',
      settings: 'id',
      tags: 'id, updatedAt',
      categories: 'id, updatedAt',
      accounts: 'id, updatedAt, order',
      exchangeRates: 'id, updatedAt',
      session: 'id',
      outbox: 'id, status, entity, createdAt',
    })

    // Version 5: transactions and transfers
    this.version(5).stores({
      users: 'id, updatedAt',
      settings: 'id',
      tags: 'id, updatedAt',
      categories: 'id, updatedAt',
      accounts: 'id, updatedAt, order',
      exchangeRates: 'id, updatedAt',
      transactions: 'id, updatedAt, accountId, date, type',
      transfers:
        'id, updatedAt, fromAccountId, toAccountId, createdAt',
      session: 'id',
      outbox: 'id, status, entity, createdAt',
    })
  }
}

export const db = new LocalDb()
