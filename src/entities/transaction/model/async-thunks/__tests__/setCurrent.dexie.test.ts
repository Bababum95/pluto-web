import { describe, expect, it, vi, beforeEach } from 'vitest'

import { createMockTransaction } from '@/testing/data/transaction'

import type { SetCurrentState } from '../setCurrent'

const getByIdMock = vi.fn()
const repositoryGetByIdMock = vi.fn()

vi.mock('@/shared/lib/local-storage/config', () => ({
  LOCAL_DATA_MODE: 'dexie' as const,
  getLocalDataMode: (): 'dexie' | 'api-only' => 'dexie',
}))

vi.mock('../../api', () => ({
  transactionApi: {
    getById: (...args: unknown[]) => getByIdMock(...args),
  },
}))

vi.mock('../../../local/repository', () => ({
  transactionRepository: {
    getById: (...args: unknown[]) => repositoryGetByIdMock(...args),
  },
}))

import { setCurrent } from '../setCurrent'

describe('setCurrent (dexie mode)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns local transaction when repository has it', async () => {
    const localTransaction = createMockTransaction({ id: 'tx-local' })
    repositoryGetByIdMock.mockResolvedValue(localTransaction)

    const state: SetCurrentState = {
      transaction: { transactions: [] },
    }

    const result = await setCurrent('tx-local')(vi.fn(), () => state, undefined)

    expect(result.type).toBe('transaction/setCurrent/fulfilled')
    expect(result.payload).toEqual(localTransaction)
    expect(repositoryGetByIdMock).toHaveBeenCalledWith('tx-local')
    expect(getByIdMock).not.toHaveBeenCalled()
  })

  it('falls back to redux state when local row is missing', async () => {
    const existing = createMockTransaction({ id: 'tx-state' })
    repositoryGetByIdMock.mockResolvedValue(null)

    const state: SetCurrentState = {
      transaction: { transactions: [existing] },
    }

    const result = await setCurrent('tx-state')(vi.fn(), () => state, undefined)

    expect(result.type).toBe('transaction/setCurrent/fulfilled')
    expect(result.payload).toEqual(existing)
    expect(getByIdMock).not.toHaveBeenCalled()
  })
})
