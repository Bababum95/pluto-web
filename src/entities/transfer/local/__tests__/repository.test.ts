import { describe, it, expect, beforeEach, vi } from 'vitest'

import { transferRepository } from '../repository'
import { db } from '@/lib/local/db'
import type { TransferDto } from '@/lib/api/generated/model'

vi.mock('@/lib/local/config', () => ({
  LOCAL_DATA_MODE: 'dexie',
}))

const baseTransfer = (overrides?: Partial<TransferDto>): TransferDto => ({
  id: 'tr-1',
  from: { account: 'acc-a', value: 1000, scale: 2 },
  to: { account: 'acc-b', value: 900, scale: 2 },
  rate: 1.1,
  fee: { value: 0, scale: 0 },
  createdAt: '2024-03-01T12:00:00.000Z',
  updatedAt: '2024-03-01T12:00:00.000Z',
  ...overrides,
})

describe('transferRepository', () => {
  beforeEach(async () => {
    await db.transfers.clear()
  })

  it('save and getById round-trip', async () => {
    const tr = baseTransfer()
    await transferRepository.save(tr)

    const got = await transferRepository.getById('tr-1')
    expect(got).toEqual(tr)
  })

  it('getByAccount returns transfers touching an account', async () => {
    await transferRepository.save(baseTransfer({ id: 't1', from: { account: 'x', value: 1, scale: 0 }, to: { account: 'y', value: 1, scale: 0 } }))
    await transferRepository.save(baseTransfer({ id: 't2', from: { account: 'z', value: 1, scale: 0 }, to: { account: 'x', value: 1, scale: 0 } }))
    await transferRepository.save(baseTransfer({ id: 't3', from: { account: 'a', value: 1, scale: 0 }, to: { account: 'b', value: 1, scale: 0 } }))

    const list = await transferRepository.getByAccount('x')
    expect(list.map((t) => t.id).sort()).toEqual(['t1', 't2'])
  })

  it('getByCreatedRange filters by calendar day', async () => {
    await transferRepository.save(
      baseTransfer({
        id: 'early',
        createdAt: '2024-03-01T10:00:00.000Z',
      })
    )
    await transferRepository.save(
      baseTransfer({
        id: 'late',
        createdAt: '2024-03-15T10:00:00.000Z',
      })
    )

    const mid = await transferRepository.getByCreatedRange(
      '2024-03-10',
      '2024-03-20'
    )
    expect(mid.map((t) => t.id)).toEqual(['late'])
  })
})
