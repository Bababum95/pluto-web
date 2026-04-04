import { describe, expect, it, vi } from 'vitest'

import type { RootState } from '@/store'

import { setCurrent } from './setCurrent'

const getByIdMock = vi.fn()

vi.mock('@/features/transaction', () => ({
  transactionApi: {
    getById: (...args: unknown[]) => getByIdMock(...args),
  },
}))

describe('setCurrent async thunk', () => {
  it('returns existing transaction from state without api call', async () => {
    const existing = {
      id: 'tx-1',
      date: '2024-01-01T00:00:00.000Z',
      comment: null,
      account: { id: 'acc-1', name: 'Cash' },
      category: {
        id: 'cat-1',
        name: 'Food',
        color: '#ff0000',
        icon: 'wallet',
      },
      tags: [],
      amount: {
        original: {
          value: 1000,
          raw: 1000,
          scale: 2,
          currency: { code: 'USD', name: 'US Dollar', symbol: '$' },
        },
        converted: {
          value: 1000,
          raw: 1000,
          scale: 2,
          currency: { code: 'USD', name: 'US Dollar', symbol: '$' },
        },
      },
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    }

    const state = {
      transaction: {
        transactions: [existing],
      },
    } as unknown as RootState

    getByIdMock.mockReset()

    const result = await setCurrent('tx-1')(
      vi.fn(),
      () => state,
      undefined
    )

    expect(result.type).toBe('transaction/setCurrent/fulfilled')
    expect(result.payload).toEqual(existing)
    expect(getByIdMock).not.toHaveBeenCalled()
  })

  it('loads transaction from api when not found in state', async () => {
    const loaded = { id: 'tx-2' }
    const state = {
      transaction: {
        transactions: [],
      },
    } as unknown as RootState

    getByIdMock.mockReset()
    getByIdMock.mockResolvedValue(loaded)

    const result = await setCurrent('tx-2')(
      vi.fn(),
      () => state,
      undefined
    )

    expect(result.type).toBe('transaction/setCurrent/fulfilled')
    expect(getByIdMock).toHaveBeenCalledWith('tx-2')
    expect(result.payload).toBe(loaded)
  })

  it('returns rejected action when api call fails', async () => {
    const state = {
      transaction: {
        transactions: [],
      },
    } as unknown as RootState

    const error = new Error('failed to load')
    getByIdMock.mockReset()
    getByIdMock.mockRejectedValue(error)

    const result = await setCurrent('tx-3')(
      vi.fn(),
      () => state,
      undefined
    )

    expect(result.type).toBe('transaction/setCurrent/rejected')
    expect(getByIdMock).toHaveBeenCalledWith('tx-3')
  })

  it('supports explicit rejectWithValue path via dispatch options', async () => {
    const state = {
      transaction: {
        transactions: [],
      },
    } as unknown as RootState

    const rejectError = new Error('reject')
    getByIdMock.mockReset()
    getByIdMock.mockRejectedValue(rejectError)

    const result = await setCurrent('tx-4')(
      vi.fn(),
      () => state,
      undefined
    )

    expect(result.type).toBe('transaction/setCurrent/rejected')
    expect(getByIdMock).toHaveBeenCalledWith('tx-4')
  })
})
