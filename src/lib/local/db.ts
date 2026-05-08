import Dexie, { type EntityTable } from 'dexie'

import type { UserRow } from '@/entities/user/local/schema'
// import type { TransactionRow } from '@/entities/transaction/local/schema'

import type { SessionRow } from './session'
import type { OutboxRow } from './outbox'

class LocalDb extends Dexie {
  users!: EntityTable<UserRow, 'id'>
  //   transactions!: EntityTable<TransactionRow, 'id'>
  session!: EntityTable<SessionRow, 'id'>
  outbox!: EntityTable<OutboxRow, 'id'>

  constructor() {
    super('pluto')

    this.version(1).stores({
      users: 'id, updatedAt',
      //   transactions: 'id, date, updatedAt, syncStatus',
      session: 'id',
      outbox: 'id, status, entity, createdAt',
    })
  }
}

export const db = new LocalDb()
