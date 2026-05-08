import { outboxProcessor } from './outbox-processor'
import { sessionRepository } from './session-repository'

export type SyncState = {
  isSyncing: boolean
  isOnline: boolean
  lastSyncAt: string | null
  error: string | null
}

export type SyncFunction = () => Promise<void>

type SyncEventType =
  | 'sync-start'
  | 'sync-complete'
  | 'sync-error'
  | 'online'
  | 'offline'

type SyncEventCallback = (state: SyncState) => void

class SyncCoordinator {
  private syncInterval: number | null = null
  private isRunning = false
  private online = navigator.onLine
  private syncing = false
  private lastError: string | null = null
  private entityHandlers = new Map<string, SyncFunction>()
  private eventCallbacks = new Set<SyncEventCallback>()

  private readonly SYNC_INTERVAL_MS = 5 * 60 * 1000

  constructor() {
    this.handleOnline = this.handleOnline.bind(this)
    this.handleOffline = this.handleOffline.bind(this)
  }

  start(): void {
    if (this.isRunning) return

    this.isRunning = true
    this.online = navigator.onLine

    window.addEventListener('online', this.handleOnline)
    window.addEventListener('offline', this.handleOffline)

    this.syncNow()

    this.syncInterval = window.setInterval(() => {
      if (this.online && !this.syncing) {
        this.syncNow()
      }
    }, this.SYNC_INTERVAL_MS)
  }

  stop(): void {
    if (!this.isRunning) return

    this.isRunning = false

    window.removeEventListener('online', this.handleOnline)
    window.removeEventListener('offline', this.handleOffline)

    if (this.syncInterval !== null) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
  }

  async syncNow(): Promise<void> {
    if (this.syncing || !this.online) return

    this.syncing = true
    this.lastError = null
    this.emitEvent('sync-start')

    try {
      for (const handler of this.entityHandlers.values()) {
        await handler()
      }

      await outboxProcessor.processPending()

      const now = new Date().toISOString()
      await sessionRepository.updateLastSync(now)

      await outboxProcessor.cleanup(7)

      this.emitEvent('sync-complete')
    } catch (error) {
      this.lastError = error instanceof Error ? error.message : 'Unknown error'
      this.emitEvent('sync-error')
      console.error('Sync error:', error)
    } finally {
      this.syncing = false
    }
  }

  registerEntity(entity: string, syncFn: SyncFunction): void {
    this.entityHandlers.set(entity, syncFn)
  }

  isOnline(): boolean {
    return this.online
  }

  onSyncStateChange(callback: SyncEventCallback): () => void {
    this.eventCallbacks.add(callback)

    return () => {
      this.eventCallbacks.delete(callback)
    }
  }

  private handleOnline(): void {
    this.online = true
    this.emitEvent('online')

    if (this.isRunning) {
      this.syncNow()
    }
  }

  private handleOffline(): void {
    this.online = false
    this.emitEvent('offline')
  }

  private async emitEvent(_type: SyncEventType): Promise<void> {
    const session = await sessionRepository.getCurrent()

    const state: SyncState = {
      isSyncing: this.syncing,
      isOnline: this.online,
      lastSyncAt: session?.lastSyncAt ?? null,
      error: this.lastError,
    }

    this.eventCallbacks.forEach((callback) => {
      try {
        callback(state)
      } catch (error) {
        console.error('Error in sync event callback:', error)
      }
    })
  }
}

export const syncCoordinator = new SyncCoordinator()
