import { syncCoordinator } from './sync-coordinator'
import { outboxProcessor } from './outbox-processor'
import { userRepository } from '@/entities/user'
import {
  settingsRepository,
  settingsApi,
  fetchSettings,
} from '@/entities/settings'
import {
  tagRepository,
  tagApi,
  addTag,
  removeTag,
} from '@/entities/tag'
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
import type { CreateTagDto, UpdateTagDto } from '@/entities/tag'
import type { UpdateSettingsDto } from '@/entities/settings'

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

  // Settings outbox handler
  outboxProcessor.registerHandler('settings', async (operation) => {
    try {
      if (operation.action !== 'update') {
        throw new Error(
          `Settings only supports update action, got: ${operation.action}`
        )
      }

      const updated = await settingsApi.update(
        operation.payload as UpdateSettingsDto
      )
      await settingsRepository.save(updated)

      // Trigger Redux update using type-safe action creator
      store.dispatch(fetchSettings.fulfilled(updated, '', undefined))
    } catch (error) {
      console.error('Settings outbox operation failed:', error)
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

  // Tag outbox handler
  outboxProcessor.registerHandler('tag', async (operation) => {
    try {
      switch (operation.action) {
        case 'create': {
          const created = await tagApi.create(
            operation.payload as CreateTagDto
          )

          // Replace temp ID with real ID from server
          if (operation.entityId.startsWith('temp-')) {
            await tagRepository.delete(operation.entityId)
            store.dispatch(removeTag(operation.entityId))
          }

          await tagRepository.save(created)
          store.dispatch(addTag(created))
          break
        }
        case 'update': {
          const updated = await tagApi.update(
            operation.entityId,
            operation.payload as UpdateTagDto
          )
          await tagRepository.save(updated)
          store.dispatch(addTag(updated))
          break
        }
        case 'delete': {
          await tagApi.delete(operation.entityId)
          await tagRepository.delete(operation.entityId)
          store.dispatch(removeTag(operation.entityId))
          break
        }
        default:
          throw new Error(`Unknown tag action: ${operation.action}`)
      }
    } catch (error) {
      console.error(`Tag ${operation.action} operation failed:`, error)
      throw error
    }
  })

  // Category outbox handler
  outboxProcessor.registerHandler('category', async (operation) => {
    try {
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
        default:
          throw new Error(`Unknown category action: ${operation.action}`)
      }
    } catch (error) {
      console.error(`Category ${operation.action} operation failed:`, error)
      throw error
    }
  })
}
