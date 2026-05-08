import { syncCoordinator } from './sync-coordinator'
import { userRepository } from '@/entities/user'
import { settingsRepository } from '@/entities/settings/local/repository'
import { tagRepository } from '@/entities/tag/local/repository'
import { authControllerGetProfile } from '@/lib/api/generated/auth/auth'
import { settingsControllerFindOne } from '@/lib/api/generated/settings/settings'
import { tagControllerFindAll } from '@/lib/api/generated/tags/tags'

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

  // Settings entity sync
  syncCoordinator.registerEntity('settings', async () => {
    try {
      const apiSettings = await settingsControllerFindOne()
      await settingsRepository.syncFromApi(apiSettings)
    } catch (error) {
      console.error('Settings sync failed:', error)
      throw error
    }
  })

  // Tag entity sync
  syncCoordinator.registerEntity('tag', async () => {
    try {
      const apiTags = await tagControllerFindAll()
      await tagRepository.syncFromApi(apiTags)
    } catch (error) {
      console.error('Tag sync failed:', error)
      throw error
    }
  })
}
