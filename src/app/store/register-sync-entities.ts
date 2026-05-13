import { syncCoordinator } from '@/shared/lib/local-storage/sync-coordinator'
import { outboxProcessor } from '@/shared/lib/local-storage/outbox-processor'
import { userRepository } from '@/entities/user'
import {
  settingsRepository,
  settingsApi,
  fetchSettings,
} from '@/entities/settings'
import { tagRepository, tagApi, addTag, removeTag } from '@/entities/tag'
import {
  categoryRepository,
  categoryApi,
  removeCategory,
  addCategory,
} from '@/entities/category'
import { accountRepository } from '@/entities/account/local'
import { exchangeRateRepository } from '@/entities/exchange-rate/local'
import { accountApi } from '@/entities/account'
import { store } from '@/app/store/store'
import {
  setAccounts,
  addAccount,
  removeAccount,
  setSummary,
  updateAccountInState,
} from '@/entities/account'
import { transactionRepository } from '@/entities/transaction/local'
import { transferRepository } from '@/entities/transfer/local'
import { transactionApi } from '@/entities/transaction/model/api'
import { transferApi } from '@/entities/transfer/model/api'
import { transactionControllerFindAll } from '@/shared/api/generated/transactions/transactions'
import { transferControllerFindAll } from '@/shared/api/generated/transfers/transfers'
import type {
  CreateTransactionDto,
  CreateTransferDto,
  UpdateTransactionDto,
  UpdateTransferDto,
} from '@/shared/api/generated/model'
import { addTransaction, removeTransaction } from '@/entities/transaction'
import { addTransfer, removeTransfer } from '@/entities/transfer'
import { authControllerGetProfile } from '@/shared/api/generated/auth/auth'
import { settingsControllerFindOne } from '@/shared/api/generated/settings/settings'
import { tagControllerFindAll } from '@/shared/api/generated/tags/tags'
import { categoryControllerFindAll } from '@/shared/api/generated/categories/categories'
import { accountControllerFindAll } from '@/shared/api/generated/accounts/accounts'
import { rateControllerFindAll } from '@/shared/api/generated/rates/rates'
import type { CreateCategoryDto, UpdateCategoryDto } from '@/entities/category'
import type { CreateTagDto, UpdateTagDto } from '@/entities/tag'
import type { UpdateSettingsDto } from '@/entities/settings'
import type {
  CreateAccountDto,
  UpdateAccountDto,
} from '@/entities/account/model/types'

let isRegistered = false

/**
 * Register all entity sync handlers with the sync coordinator.
 * Call this once during app initialization before starting the sync coordinator.
 * This function is idempotent - calling it multiple times has no effect.
 */
export function registerSyncEntities(): void {
  if (isRegistered) return
  isRegistered = true

  const refreshAccountsFromApi = async (): Promise<void> => {
    const response = await accountControllerFindAll()
    await accountRepository.syncFromApi(response.list || [])
    store.dispatch(setAccounts(response.list || []))
    if (response.summary) {
      store.dispatch(setSummary(response.summary))
    }
  }

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
          const created = await tagApi.create(operation.payload as CreateTagDto)

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

  // Account entity sync (Dexie + Redux + summary, same as refreshAccountsFromApi)
  syncCoordinator.registerEntity('account', async () => {
    try {
      await refreshAccountsFromApi()
    } catch (error) {
      console.error('Account sync failed:', error)
      throw error
    }
  })

  // Account outbox handler
  outboxProcessor.registerHandler('account', async (operation) => {
    try {
      switch (operation.action) {
        case 'create': {
          const created = await accountApi.create(
            operation.payload as CreateAccountDto
          )

          // Replace temp ID with real ID from server
          if (operation.entityId.startsWith('temp-')) {
            await accountRepository.delete(operation.entityId)
            store.dispatch(removeAccount(operation.entityId))
          }

          await accountRepository.save(created.account)
          store.dispatch(addAccount(created.account))
          store.dispatch(setSummary(created.summary))
          break
        }
        case 'update': {
          // Handle special operations by entityId
          if (operation.entityId === 'bulk-reorder') {
            await accountApi.reorder(operation.payload as { ids: string[] })
            // Fetch updated accounts to get new order
            const response = await accountControllerFindAll()
            await accountRepository.saveMany(response.list || [])
            store.dispatch(setAccounts(response.list || []))
            if (response.summary) {
              store.dispatch(setSummary(response.summary))
            }
          } else if (
            typeof operation.payload === 'object' &&
            operation.payload !== null &&
            'toggleExcluded' in operation.payload
          ) {
            const updated = await accountApi.toggleExcluded(operation.entityId)
            await accountRepository.save(updated.account)
            store.dispatch(addAccount(updated.account))
            store.dispatch(setSummary(updated.summary))
          } else {
            const updated = await accountApi.update(
              operation.entityId,
              operation.payload as UpdateAccountDto
            )
            await accountRepository.save(updated.account)
            store.dispatch(addAccount(updated.account))
            store.dispatch(setSummary(updated.summary))
          }
          break
        }
        case 'delete': {
          const summary = await accountApi.delete(operation.entityId)
          await accountRepository.delete(operation.entityId)
          store.dispatch(removeAccount(operation.entityId))
          store.dispatch(setSummary(summary))
          break
        }
        default:
          throw new Error(`Unknown account action: ${operation.action}`)
      }
    } catch (error) {
      console.error(`Account ${operation.action} operation failed:`, error)
      throw error
    }
  })

  // ExchangeRate entity sync
  syncCoordinator.registerEntity('exchangeRate', async () => {
    try {
      const apiRates = await rateControllerFindAll()
      await exchangeRateRepository.syncFromApi(apiRates)
    } catch (error) {
      console.error('ExchangeRate sync failed:', error)
      throw error
    }
  })

  // Transaction entity sync
  syncCoordinator.registerEntity('transaction', async () => {
    try {
      const apiTransactions = await transactionControllerFindAll()
      await transactionRepository.syncFromApi(apiTransactions)
    } catch (error) {
      console.error('Transaction sync failed:', error)
      throw error
    }
  })

  // Transfer entity sync
  syncCoordinator.registerEntity('transfer', async () => {
    try {
      const apiTransfers = await transferControllerFindAll()
      await transferRepository.syncFromApi(apiTransfers)
    } catch (error) {
      console.error('Transfer sync failed:', error)
      throw error
    }
  })

  outboxProcessor.registerHandler('transaction', async (operation) => {
    try {
      switch (operation.action) {
        case 'create': {
          const createdResponse = await transactionApi.create(
            operation.payload as CreateTransactionDto
          )

          if (operation.entityId.startsWith('temp-')) {
            await transactionRepository.delete(operation.entityId)
            store.dispatch(removeTransaction(operation.entityId))
          }

          await transactionRepository.save(createdResponse.transaction)
          store.dispatch(addTransaction(createdResponse.transaction))
          if (createdResponse.account) {
            store.dispatch(updateAccountInState(createdResponse.account))
          }
          if (createdResponse.summary) {
            store.dispatch(setSummary(createdResponse.summary))
          }
          break
        }
        case 'update': {
          const payload = operation.payload as {
            data: UpdateTransactionDto
            params?: Record<string, string>
          }
          const updated = await transactionApi.update(
            operation.entityId,
            payload.data,
            payload.params
          )

          await transactionRepository.save(updated.transaction)
          store.dispatch(addTransaction(updated.transaction))
          if (updated.account) {
            store.dispatch(updateAccountInState(updated.account))
          }
          if (updated.summary) {
            store.dispatch(setSummary(updated.summary))
          }
          break
        }
        case 'delete': {
          await transactionApi.delete(operation.entityId)
          await refreshAccountsFromApi()
          break
        }
        default:
          throw new Error(`Unknown transaction action: ${operation.action}`)
      }
    } catch (error) {
      console.error(`Transaction ${operation.action} operation failed:`, error)
      throw error
    }
  })

  outboxProcessor.registerHandler('transfer', async (operation) => {
    try {
      switch (operation.action) {
        case 'create': {
          const created = await transferApi.create(
            operation.payload as CreateTransferDto
          )

          if (operation.entityId.startsWith('temp-')) {
            await transferRepository.delete(operation.entityId)
            store.dispatch(removeTransfer(operation.entityId))
          }

          await transferRepository.save(created)
          store.dispatch(addTransfer(created))
          await refreshAccountsFromApi()
          break
        }
        case 'update': {
          const updated = await transferApi.update(
            operation.entityId,
            operation.payload as UpdateTransferDto
          )

          await transferRepository.save(updated)
          store.dispatch(addTransfer(updated))
          await refreshAccountsFromApi()
          break
        }
        case 'delete': {
          await transferApi.delete(operation.entityId)
          await refreshAccountsFromApi()
          break
        }
        default:
          throw new Error(`Unknown transfer action: ${operation.action}`)
      }
    } catch (error) {
      console.error(`Transfer ${operation.action} operation failed:`, error)
      throw error
    }
  })
}
