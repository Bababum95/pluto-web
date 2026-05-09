import { syncCoordinator } from './sync-coordinator'
import { outboxProcessor } from './outbox-processor'
import { userRepository } from '@/entities/user'
import { settingsRepository } from '@/entities/settings/local/repository'
import { tagRepository } from '@/entities/tag/local/repository'
import {
  categoryRepository,
  categoryApi,
  removeCategory,
  addCategory,
} from '@/entities/category'
import { store } from '@/store'
import { authControllerGetProfile } from '@/lib/api/generated/auth/auth'
import { settingsControllerFindOne } from '@/lib/api/generated/settings/settings'
import { tagControllerFindAll } from '@/lib/api/generated/tags/tags'
import { categoryControllerFindAll } from '@/lib/api/generated/categories/categories'
import type { CreateCategoryDto, UpdateCategoryDto } from '@/entities/category'

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

  // Category entity sync
  syncCoordinator.registerEntity('category', async () => {
    try {
      const apiCategories = await categoryControllerFindAll()
      await categoryRepository.syncFromApi(apiCategories)
    } catch (error) {
      console.error('Category sync failed:', error)
      throw error
    }
  })

  // Category outbox handler
  outboxProcessor.registerHandler('category', async (operation) => {
    switch (operation.action) {
      case 'create': {
        const created = await categoryApi.create(
          operation.payload as CreateCategoryDto
        )

        // Replace temp ID with real ID from server
        if (operation.entityId.startsWith('temp-')) {
          await categoryRepository.delete(operation.entityId)
          store.dispatch(removeCategory(operation.entityId))
        }

        await categoryRepository.save(created)
        store.dispatch(addCategory(created))
        break
      }
      case 'update': {
        const updated = await categoryApi.update(
          operation.entityId,
          operation.payload as UpdateCategoryDto
        )
        await categoryRepository.save(updated)
        store.dispatch(addCategory(updated))
        break
      }
      case 'delete': {
        await categoryApi.delete(operation.entityId)
        await categoryRepository.delete(operation.entityId)
        store.dispatch(removeCategory(operation.entityId))
        break
      }
    }
  })
}
