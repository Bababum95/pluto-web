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

  describe('save / getById', () => {
    it('round-trips a single transfer', async () => {
      const tr = baseTransfer()
      await transferRepository.save(tr)

      const got = await transferRepository.getById('tr-1')
      expect(got).toEqual(tr)
    })

    it('returns null when transfer is missing', async () => {
      const got = await transferRepository.getById('missing')
      expect(got).toBeNull()
    })

    it('marks temp ids dirty and leaves syncedAt undefined', async () => {
      await transferRepository.save(baseTransfer({ id: 'temp-x' }))
      const row = await db.transfers.get('temp-x')
      expect(row?.isDirty).toBe(true)
      expect(row?.syncedAt).toBeUndefined()
    })

    it('marks server ids clean and stamps syncedAt', async () => {
      await transferRepository.save(baseTransfer())
      const row = await db.transfers.get('tr-1')
      expect(row?.isDirty).toBe(false)
      expect(row?.syncedAt).toBeTruthy()
    })
  })

  describe('saveMany', () => {
    it('bulk-puts a mix of server and temp rows with correct flags', async () => {
      await transferRepository.saveMany([
        baseTransfer({ id: 'tr-1' }),
        baseTransfer({ id: 'temp-2' }),
      ])

      const rows = await db.transfers.toArray()
      const byId = Object.fromEntries(rows.map((r) => [r.id, r]))
      expect(byId['tr-1'].isDirty).toBe(false)
      expect(byId['tr-1'].syncedAt).toBeTruthy()
      expect(byId['temp-2'].isDirty).toBe(true)
      expect(byId['temp-2'].syncedAt).toBeUndefined()
    })
  })

  describe('getAll', () => {
    it('returns transfers sorted by createdAt desc', async () => {
      await transferRepository.saveMany([
        baseTransfer({ id: 'old', createdAt: '2024-01-01T00:00:00.000Z' }),
        baseTransfer({ id: 'new', createdAt: '2024-06-01T00:00:00.000Z' }),
        baseTransfer({ id: 'mid', createdAt: '2024-03-01T00:00:00.000Z' }),
      ])

      const list = await transferRepository.getAll()
      expect(list.map((t) => t.id)).toEqual(['new', 'mid', 'old'])
    })

    it('returns empty array when table is empty', async () => {
      const list = await transferRepository.getAll()
      expect(list).toEqual([])
    })
  })

  describe('getByAccount', () => {
    it('returns transfers touching the account on either side, deduped', async () => {
      await transferRepository.save(
        baseTransfer({
          id: 't1',
          from: { account: 'x', value: 1, scale: 0 },
          to: { account: 'y', value: 1, scale: 0 },
        })
      )
      await transferRepository.save(
        baseTransfer({
          id: 't2',
          from: { account: 'z', value: 1, scale: 0 },
          to: { account: 'x', value: 1, scale: 0 },
        })
      )
      await transferRepository.save(
        baseTransfer({
          id: 't3',
          from: { account: 'a', value: 1, scale: 0 },
          to: { account: 'b', value: 1, scale: 0 },
        })
      )

      const list = await transferRepository.getByAccount('x')
      expect(list.map((t) => t.id).sort()).toEqual(['t1', 't2'])
    })

    it('returns one entry when an account is on both sides of the same transfer', async () => {
      await transferRepository.save(
        baseTransfer({
          id: 'self',
          from: { account: 'same', value: 1, scale: 0 },
          to: { account: 'same', value: 1, scale: 0 },
        })
      )

      const list = await transferRepository.getByAccount('same')
      expect(list.map((t) => t.id)).toEqual(['self'])
    })
  })

  describe('getByCreatedRange', () => {
    it('filters by inclusive calendar-day bounds', async () => {
      await transferRepository.saveMany([
        baseTransfer({
          id: 'before',
          createdAt: '2024-02-28T10:00:00.000Z',
        }),
        baseTransfer({
          id: 'lower',
          createdAt: '2024-03-01T10:00:00.000Z',
        }),
        baseTransfer({
          id: 'upper',
          createdAt: '2024-03-31T10:00:00.000Z',
        }),
        baseTransfer({
          id: 'after',
          createdAt: '2024-04-01T10:00:00.000Z',
        }),
      ])

      const list = await transferRepository.getByCreatedRange(
        '2024-03-01',
        '2024-03-31'
      )
      expect(list.map((t) => t.id).sort()).toEqual(['lower', 'upper'])
    })

    it('returns every transfer when no bounds are provided', async () => {
      await transferRepository.saveMany([
        baseTransfer({
          id: 'a',
          createdAt: '2024-01-01T10:00:00.000Z',
        }),
        baseTransfer({
          id: 'b',
          createdAt: '2024-12-31T10:00:00.000Z',
        }),
      ])

      const list = await transferRepository.getByCreatedRange()
      expect(list.map((t) => t.id).sort()).toEqual(['a', 'b'])
    })

    it('respects an open lower or upper bound', async () => {
      await transferRepository.saveMany([
        baseTransfer({
          id: 'a',
          createdAt: '2024-01-01T10:00:00.000Z',
        }),
        baseTransfer({
          id: 'b',
          createdAt: '2024-06-01T10:00:00.000Z',
        }),
        baseTransfer({
          id: 'c',
          createdAt: '2024-12-31T10:00:00.000Z',
        }),
      ])

      const upperOnly = await transferRepository.getByCreatedRange(
        undefined,
        '2024-06-01'
      )
      expect(upperOnly.map((t) => t.id).sort()).toEqual(['a', 'b'])

      const lowerOnly = await transferRepository.getByCreatedRange('2024-06-01')
      expect(lowerOnly.map((t) => t.id).sort()).toEqual(['b', 'c'])
    })
  })

  describe('update', () => {
    it('partial-updates an existing transfer and marks it dirty', async () => {
      await transferRepository.save(baseTransfer({ id: 'tr-1' }))

      await transferRepository.update('tr-1', { rate: 2.5 })

      const row = await db.transfers.get('tr-1')
      expect(row?.payload.rate).toBe(2.5)
      expect(row?.isDirty).toBe(true)
    })

    it('refreshes denormalized indexes when accounts or createdAt change', async () => {
      await transferRepository.save(baseTransfer({ id: 'tr-1' }))

      await transferRepository.update('tr-1', {
        from: { account: 'new-from', value: 1, scale: 0 },
        to: { account: 'new-to', value: 1, scale: 0 },
        createdAt: '2024-09-09T00:00:00.000Z',
      })

      const row = await db.transfers.get('tr-1')
      expect(row?.fromAccountId).toBe('new-from')
      expect(row?.toAccountId).toBe('new-to')
      expect(row?.createdAt).toBe('2024-09-09T00:00:00.000Z')
    })

    it('is a no-op when the row does not exist', async () => {
      await transferRepository.update('missing', { rate: 5 })
      expect(await db.transfers.get('missing')).toBeUndefined()
    })
  })

  describe('delete', () => {
    it('removes a transfer by id', async () => {
      await transferRepository.save(baseTransfer({ id: 'tr-1' }))
      await transferRepository.delete('tr-1')
      expect(await db.transfers.get('tr-1')).toBeUndefined()
    })
  })

  describe('syncFromApi', () => {
    it('upserts non-dirty rows with isDirty=false and stamped syncedAt', async () => {
      await transferRepository.syncFromApi([
        baseTransfer({
          id: 'srv-1',
          updatedAt: '2024-06-01T00:00:00.000Z',
        }),
      ])

      const row = await db.transfers.get('srv-1')
      expect(row?.isDirty).toBe(false)
      expect(row?.syncedAt).toBeTruthy()
      expect(row?.updatedAt).toBe('2024-06-01T00:00:00.000Z')
    })

    it('skips rows marked dirty locally', async () => {
      await transferRepository.save(baseTransfer({ id: 'tr-1', rate: 1.0 }))
      await transferRepository.update('tr-1', { rate: 9.9 })

      await transferRepository.syncFromApi([
        baseTransfer({ id: 'tr-1', rate: 0.5 }),
      ])

      const merged = await transferRepository.getById('tr-1')
      expect(merged?.rate).toBe(9.9)
    })

    it('skips entries without id or account fields', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      await transferRepository.syncFromApi([
        baseTransfer({ id: 'good' }),
        { ...baseTransfer({ id: 'good' }), id: '' } as TransferDto,
        {
          ...baseTransfer({ id: 'no-from' }),
          from: undefined as never,
        } as TransferDto,
        {
          ...baseTransfer({ id: 'no-to' }),
          to: undefined as never,
        } as TransferDto,
      ])

      const rows = await db.transfers.toArray()
      expect(rows.map((r) => r.id)).toEqual(['good'])
      expect(warnSpy).toHaveBeenCalledTimes(3)
      warnSpy.mockRestore()
    })

    it('logs and bails on non-array input', async () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await transferRepository.syncFromApi(null as unknown as TransferDto[])

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('invalid transfers data')
      )
      expect(await db.transfers.toArray()).toEqual([])
      errorSpy.mockRestore()
    })
  })

  describe('clear', () => {
    it('drops every row in the transfers table', async () => {
      await transferRepository.saveMany([
        baseTransfer({ id: 'tr-1' }),
        baseTransfer({ id: 'tr-2' }),
      ])

      await transferRepository.clear()
      expect(await db.transfers.toArray()).toEqual([])
    })
  })
})
