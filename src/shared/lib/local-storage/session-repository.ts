import { db } from './db'
import type { SessionRow } from './session'

export const sessionRepository = {
  async getCurrent(): Promise<SessionRow | undefined> {
    return db.session.get('current')
  },

  async updateCurrentUser(userId: string | null): Promise<void> {
    const existing = await db.session.get('current')

    if (existing) {
      await db.session.update('current', {
        currentUserId: userId,
        updatedAt: new Date().toISOString(),
      })
    } else {
      await db.session.add({
        id: 'current',
        currentUserId: userId,
        updatedAt: new Date().toISOString(),
      })
    }
  },

  async updateLastSync(timestamp: string): Promise<void> {
    const existing = await db.session.get('current')

    if (existing) {
      await db.session.update('current', {
        lastSyncAt: timestamp,
        updatedAt: new Date().toISOString(),
      })
    }
  },

  async clear(): Promise<void> {
    await db.session.delete('current')
  },
}
