import {
  describe,
  it,
  expect,
  beforeAll,
  beforeEach,
  afterEach,
  afterAll,
  vi,
} from 'vitest'

vi.mock('@/shared/lib/local-storage/config', () => ({
  LOCAL_DATA_MODE: 'dexie' as const,
  getLocalDataMode: (): 'dexie' | 'api-only' => 'dexie',
}))

import { http, HttpResponse } from 'msw'

import { registerSyncEntities } from '@/app/store/register-sync-entities'
import { syncCoordinator } from '@/shared/lib/local-storage/sync-coordinator'
import { generateTempEntityId } from '@/shared/lib/local-storage/temp-id'
import { outboxProcessor } from '@/shared/lib/local-storage/outbox-processor'
import { db } from '@/shared/lib/local-storage/db'
import { sessionRepository } from '@/shared/lib/local-storage/session-repository'
import { userRepository } from '@/entities/user'
import { transactionRepository } from '@/entities/transaction/local/repository'
import { transferRepository } from '@/entities/transfer/local/repository'
import { accountRepository } from '@/entities/account/local/repository'
import { mockUser } from '@/testing/data/user'
import {
  mockTransaction,
  createMockTransaction,
} from '@/testing/data/transaction'
import { mockTag } from '@/testing/data/tag'
import { mockCategory } from '@/testing/data/category'
import { createMockTransfer } from '@/testing/data/transfer'
import { mockAccountListResponse } from '@/testing/data/account'
import { server } from '@/testing/server'
import { TEST_API_ROOT } from '@/testing/constants'
import type {
  CreateTransactionDto,
  CreateTransferDto,
} from '@/shared/api/generated/model'
import * as syncUtils from '@/shared/lib/local-storage/sync-utils'
import { store } from '@/app/store'
import { clearTransactions } from '@/entities/transaction'
import { clearTransfers } from '@/entities/transfer'

async function resetLocalDb(): Promise<void> {
  await Promise.all([
    db.users.clear(),
    db.settings.clear(),
    db.tags.clear(),
    db.categories.clear(),
    db.accounts.clear(),
    db.exchangeRates.clear(),
    db.transactions.clear(),
    db.transfers.clear(),
    db.session.clear(),
    db.outbox.clear(),
  ])
}

describe('local-first integration', () => {
  beforeAll(() => {
    registerSyncEntities()
  })

  beforeEach(async () => {
    vi.spyOn(syncUtils, 'calculateBackoff').mockReturnValue(0)
    await resetLocalDb()
    store.dispatch(clearTransactions())
    store.dispatch(clearTransfers())
    await sessionRepository.updateCurrentUser(mockUser.id)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  afterAll(() => {
    syncCoordinator.stop()
  })

  describe('sync flow (MSW + Dexie + coordinator)', () => {
    it('writes user profile to IndexedDB after user sync handler runs', async () => {
      const userHandler = syncCoordinator.getEntityHandler('user')
      expect(userHandler).toBeDefined()

      await userHandler!()

      const local = await userRepository.getById(mockUser.id)
      expect(local).toMatchObject({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
      })
    })

    it('runs full sync: entities populate Dexie and session lastSyncAt updates', async () => {
      await syncCoordinator.syncNow()

      const session = await sessionRepository.getCurrent()
      expect(session?.lastSyncAt).toBeDefined()

      const users = await userRepository.getAll()
      expect(users.length).toBeGreaterThan(0)

      const transactions = await transactionRepository.getAll()
      expect(transactions.some((t) => t.id === mockTransaction.id)).toBe(true)
    })

    it('keeps dirty local transaction when API list is merged (conflict: local wins)', async () => {
      const tx = createMockTransaction({
        id: mockTransaction.id,
        comment: 'offline-edit',
      })
      await transactionRepository.save(tx)
      await transactionRepository.update(mockTransaction.id, {
        comment: 'offline-edit',
      })

      const transactionHandler = syncCoordinator.getEntityHandler('transaction')
      await transactionHandler!()

      const local = await transactionRepository.getById(mockTransaction.id)
      expect(local?.comment).toBe('offline-edit')
    })
  })

  describe('outbox processing (registered handlers + MSW)', () => {
    let consoleErrorSpy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
      consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
      consoleErrorSpy.mockRestore()
    })

    it('reconciles temp transaction id after create succeeds', async () => {
      const tempId = generateTempEntityId()
      await transactionRepository.save(
        createMockTransaction({
          id: tempId,
          comment: 'queued',
        })
      )

      const payload: CreateTransactionDto = {
        type: 'expense',
        category: mockCategory.id,
        account: mockTransaction.account.id,
        amount: -50,
        scale: 2,
        tags: [mockTag.id],
        date: '2024-01-20',
      }

      await outboxProcessor.enqueue({
        entity: 'transaction',
        action: 'create',
        entityId: tempId,
        payload,
      })

      const result = await outboxProcessor.processPending()

      expect(result.succeeded).toBeGreaterThanOrEqual(1)

      expect(await transactionRepository.getById(tempId)).toBeNull()
      expect(
        await transactionRepository.getById(mockTransaction.id)
      ).not.toBeNull()
    })

    it('marks outbox row failed after max attempts and does not retry', async () => {
      server.use(
        http.post(`${TEST_API_ROOT}transactions`, () =>
          HttpResponse.json({ message: 'Server error' }, { status: 500 })
        )
      )

      await outboxProcessor.enqueue({
        entity: 'transaction',
        action: 'create',
        entityId: 'temp-fail',
        payload: {
          type: 'expense',
          category: mockCategory.id,
          account: mockTransaction.account.id,
          amount: -10,
          scale: 2,
        } satisfies CreateTransactionDto,
      })

      await outboxProcessor.processPending()
      await outboxProcessor.processPending()
      await outboxProcessor.processPending()

      const rows = await db.outbox.toArray()
      const op = rows.find((r) => r.entityId === 'temp-fail')
      expect(op?.status).toBe('failed')
      expect(op?.attempts).toBe(3)
    })

    it('invokes calculateBackoff with attempt number after a failed attempt', async () => {
      const backoffSpy = vi.mocked(syncUtils.calculateBackoff)

      let posts = 0
      server.use(
        http.post(`${TEST_API_ROOT}transactions`, () => {
          posts += 1
          if (posts === 1) {
            return HttpResponse.json({ message: 'Temporary' }, { status: 503 })
          }
          return HttpResponse.json({
            account: mockAccountListResponse.list[0],
            summary: mockAccountListResponse.summary,
            transaction: mockTransaction,
          })
        })
      )

      await outboxProcessor.enqueue({
        entity: 'transaction',
        action: 'create',
        entityId: 'temp-retry',
        payload: {
          type: 'expense',
          category: mockCategory.id,
          account: mockTransaction.account.id,
          amount: -5,
          scale: 2,
        } satisfies CreateTransactionDto,
      })

      await outboxProcessor.processPending()

      expect(backoffSpy).toHaveBeenCalledWith(1)
      expect(backoffSpy).toHaveReturnedWith(0)

      await outboxProcessor.processPending()

      expect(
        await transactionRepository.getById(mockTransaction.id)
      ).not.toBeNull()
    })

    it('removes stale done outbox rows during full sync cleanup', async () => {
      const old = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
      await db.outbox.add({
        id: 'old-done',
        entity: 'user',
        action: 'update',
        entityId: 'noop',
        payload: {},
        status: 'done',
        attempts: 1,
        createdAt: old,
        updatedAt: old,
      })

      await syncCoordinator.syncNow()

      expect(await db.outbox.get('old-done')).toBeUndefined()
    })
  })

  describe('multi-entity consistency', () => {
    it('persists category and tag references on synced transactions', async () => {
      const transactionHandler = syncCoordinator.getEntityHandler('transaction')
      await transactionHandler!()

      const tx = await transactionRepository.getById(mockTransaction.id)
      expect(tx?.category.id).toBe(mockCategory.id)
      expect(tx?.tags?.[0]?.id).toBe(mockTag.id)
    })

    it('persists transfer after outbox create and refreshes accounts in Dexie', async () => {
      const tempId = generateTempEntityId()
      await transferRepository.save(
        createMockTransfer({
          id: tempId,
        })
      )

      const payload: CreateTransferDto = {
        from: { account: 'account-1', value: 10000, scale: 2 },
        to: { account: 'account-2', value: 9100, scale: 2 },
        rate: 0.91,
      }

      await outboxProcessor.enqueue({
        entity: 'transfer',
        action: 'create',
        entityId: tempId,
        payload,
      })

      await outboxProcessor.processPending()

      expect(await transferRepository.getById(tempId)).toBeNull()
      const persisted = await transferRepository.getById('transfer-1')
      expect(persisted).not.toBeNull()

      const accounts = await accountRepository.getAll()
      expect(accounts.length).toBeGreaterThan(0)
    })
  })
})
