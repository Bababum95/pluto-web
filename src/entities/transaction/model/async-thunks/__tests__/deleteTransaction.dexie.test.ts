import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/app/store', () => ({
  createStore: vi.fn(() => ({
    getState: vi.fn(() => ({})),
    dispatch: vi.fn(),
  })),
}))

import { deleteTransaction } from '../deleteTransaction'
import { transactionApi } from '../../api'
import { transactionRepository } from '../../../local/repository'
import { enqueueDeleteTransaction } from '../../../local/outbox-helpers'

vi.mock('@/shared/lib/local-storage/config', () => ({
  LOCAL_DATA_MODE: 'dexie' as const,
  getLocalDataMode: (): 'dexie' | 'api-only' => 'dexie',
}))

vi.mock('../../api')
vi.mock('../../../local/repository')
vi.mock('../../../local/outbox-helpers')

describe('deleteTransaction (dexie mode)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deletes locally and enqueues outbox operation', async () => {
    vi.mocked(transactionRepository.delete).mockResolvedValue()
    vi.mocked(enqueueDeleteTransaction).mockResolvedValue()

    await deleteTransaction('txn-1')(vi.fn(), vi.fn(), undefined)

    expect(transactionRepository.delete).toHaveBeenCalledWith('txn-1')
    expect(enqueueDeleteTransaction).toHaveBeenCalledWith('txn-1')
    expect(transactionApi.delete).not.toHaveBeenCalled()
  })
})
