import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/app/store', () => ({
  createStore: vi.fn(() => ({
    getState: vi.fn(() => ({})),
    dispatch: vi.fn(),
  })),
}))

import { deleteTransfer } from '../deleteTransfer'
import { transferApi } from '../../api'
import { transferRepository } from '../../../local/repository'
import { enqueueDeleteTransfer } from '../../../local/outbox-helpers'

vi.mock('@/shared/lib/local-storage/config', () => ({
  LOCAL_DATA_MODE: 'dexie' as const,
  getLocalDataMode: (): 'dexie' | 'api-only' => 'dexie',
}))

vi.mock('../../api')
vi.mock('../../../local/repository')
vi.mock('../../../local/outbox-helpers')

describe('deleteTransfer (dexie mode)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deletes locally and enqueues outbox operation', async () => {
    vi.mocked(transferRepository.delete).mockResolvedValue()
    vi.mocked(enqueueDeleteTransfer).mockResolvedValue()

    await deleteTransfer('transfer-1')(vi.fn(), vi.fn(), undefined)

    expect(transferRepository.delete).toHaveBeenCalledWith('transfer-1')
    expect(enqueueDeleteTransfer).toHaveBeenCalledWith('transfer-1')
    expect(transferApi.delete).not.toHaveBeenCalled()
  })
})
