import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/app/store', () => ({
  createStore: vi.fn(() => ({
    getState: vi.fn(() => ({})),
    dispatch: vi.fn(),
  })),
}))

import { deleteTransaction } from '../deleteTransaction'
import { transactionApi } from '../../api'
import { transactionLocalApi } from '../../../local/operations'

vi.mock('@/shared/lib/local-storage/config', () => ({
  LOCAL_DATA_MODE: 'dexie' as const,
  getLocalDataMode: (): 'dexie' | 'api-only' => 'dexie',
}))

vi.mock('../../api')
vi.mock('../../../local/operations')

describe('deleteTransaction (dexie mode)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deletes locally via transactionLocalApi', async () => {
    vi.mocked(transactionLocalApi.delete).mockResolvedValue()

    await deleteTransaction('txn-1')(vi.fn(), vi.fn(), undefined)

    expect(transactionLocalApi.delete).toHaveBeenCalledWith('txn-1')
    expect(transactionApi.delete).not.toHaveBeenCalled()
  })
})
