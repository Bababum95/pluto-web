export type SessionRow = {
  id: 'current'
  currentUserId: string | null
  lastSyncAt?: string | null
  updatedAt: string
}
