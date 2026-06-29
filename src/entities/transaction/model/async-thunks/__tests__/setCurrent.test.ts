import { describe, expect, it, vi } from 'vitest'

import { createMockTransaction } from '@/testing/data/transaction'

import type { SetCurrentState } from '../setCurrent'

const getByIdMock = vi.fn()

vi.mock('@/shared/lib/local-storage/config', () => ({
  LOCAL_DATA_MODE: 'api-only' as const,
  getLocalDataMode: (): 'dexie' | 'api-only' => 'api-only',
}))

vi.mock('../../api', () => ({
  transactionApi: {
    getById: (...args: unknown[]) => getByIdMock(...args),
  },
}))

vi.mock('../../../local/repository', () => ({
  transactionRepository: {
    getById: vi.fn(),
  },
}))

import { setCurrent } from '../setCurrent'

const emptyState: SetCurrentState = {
  transaction: { transactions: [] },
}

describe('setCurrent async thunk', () => {
  it('returns existing transaction from state without api call', async () => {
    const existing = createMockTransaction({ id: 'tx-1' })
    const state: SetCurrentState = {
      transaction: {
        transactions: [existing],
      },
    }

    getByIdMock.mockReset()

    const result = await setCurrent('tx-1')(vi.fn(), () => state, undefined)

    expect(result.type).toBe('transaction/setCurrent/fulfilled')
    expect(result.payload).toEqual(existing)
    expect(getByIdMock).not.toHaveBeenCalled()
  })

  it('loads transaction from api when not found in state', async () => {
    const loaded = createMockTransaction({ id: 'tx-2' })

    getByIdMock.mockReset()
    getByIdMock.mockResolvedValue(loaded)

    const result = await setCurrent('tx-2')(vi.fn(), () => emptyState, undefined)

    expect(result.type).toBe('transaction/setCurrent/fulfilled')
    expect(getByIdMock).toHaveBeenCalledWith('tx-2')
    expect(result.payload).toBe(loaded)
  })

  it('returns rejected action when api call fails', async () => {
    const error = new Error('failed to load')
    getByIdMock.mockReset()
    getByIdMock.mockRejectedValue(error)

    const result = await setCurrent('tx-3')(vi.fn(), () => emptyState, undefined)

    expect(result.type).toBe('transaction/setCurrent/rejected')
    expect(getByIdMock).toHaveBeenCalledWith('tx-3')
  })

  it('supports explicit rejectWithValue path via dispatch options', async () => {
    const rejectError = new Error('reject')
    getByIdMock.mockReset()
    getByIdMock.mockRejectedValue(rejectError)

    const result = await setCurrent('tx-4')(vi.fn(), () => emptyState, undefined)

    expect(result.type).toBe('transaction/setCurrent/rejected')
    expect(getByIdMock).toHaveBeenCalledWith('tx-4')
  })
})
