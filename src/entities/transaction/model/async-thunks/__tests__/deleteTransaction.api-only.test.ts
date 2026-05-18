import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/app/store', () => ({
  createStore: vi.fn(() => ({
    getState: vi.fn(() => ({})),
    dispatch: vi.fn(),
  })),
}))

import { deleteTransaction } from '../deleteTransaction'
import { transactionApi } from '../../api'

vi.mock('@/shared/lib/local-storage/config', () => ({
  LOCAL_DATA_MODE: 'api-only' as const,
  getLocalDataMode: (): 'dexie' | 'api-only' => 'api-only',
}))

vi.mock('../../api')
vi.mock('../../../local/repository')
vi.mock('../../../local/outbox-helpers')

describe('deleteTransaction (api-only mode)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deletes transaction via API', async () => {
    vi.mocked(transactionApi.delete).mockResolvedValue()

    await deleteTransaction('txn-1')(vi.fn(), vi.fn(), undefined)

    expect(transactionApi.delete).toHaveBeenCalledWith('txn-1')
  })
})
