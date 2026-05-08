import { syncCoordinator } from './sync-coordinator'
import { userRepository } from '@/entities/user'
import { authControllerGetProfile } from '@/lib/api/generated/auth/auth'

let isRegistered = false

/**
 * Register all entity sync handlers with the sync coordinator.
 * Call this once during app initialization before starting the sync coordinator.
 * This function is idempotent - calling it multiple times has no effect.
 */
export function registerSyncEntities(): void {
  if (isRegistered) return
  isRegistered = true

  // User entity sync
  syncCoordinator.registerEntity('user', async () => {
    try {
      const apiUser = await authControllerGetProfile()
      await userRepository.syncFromApi(apiUser)
    } catch (error) {
      console.error('User sync failed:', error)
      throw error
    }
  })
}
