import Dexie, { type EntityTable } from 'dexie'

import type { UserRow } from '@/entities/user/local/schema'
import type { SettingsRow } from '@/entities/settings/local/schema'
import type { TagRow } from '@/entities/tag/local/schema'
import type { CategoryRow } from '@/entities/category/local/schema'
// import type { TransactionRow } from '@/entities/transaction/local/schema'

import type { SessionRow } from './session'
import type { OutboxRow } from './outbox'

class LocalDb extends Dexie {
  users!: EntityTable<UserRow, 'id'>
  settings!: EntityTable<SettingsRow, 'id'>
  tags!: EntityTable<TagRow, 'id'>
  categories!: EntityTable<CategoryRow, 'id'>
  //   transactions!: EntityTable<TransactionRow, 'id'>
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
  }
}

export const db = new LocalDb()
