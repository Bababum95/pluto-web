import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/app/store', () => ({
  createStore: vi.fn(() => ({
    getState: vi.fn(() => ({})),
    dispatch: vi.fn(),
  })),
}))

import { deleteTransfer } from '../deleteTransfer'
import { transferApi } from '../../api'

vi.mock('@/shared/lib/local-storage/config', () => ({
  LOCAL_DATA_MODE: 'api-only' as const,
  getLocalDataMode: (): 'dexie' | 'api-only' => 'api-only',
}))

vi.mock('../../api')
vi.mock('../../../local/repository')
vi.mock('../../../local/outbox-helpers')

describe('deleteTransfer (api-only mode)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deletes transfer via API', async () => {
    vi.mocked(transferApi.delete).mockResolvedValue()

    await deleteTransfer('transfer-1')(vi.fn(), vi.fn(), undefined)

    expect(transferApi.delete).toHaveBeenCalledWith('transfer-1')
  })
})
