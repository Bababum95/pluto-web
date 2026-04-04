import { describe, expect, it, vi } from 'vitest'

const apiFetchMock = vi.fn()
const invalidateQueriesMock = vi.fn()

vi.mock('@/lib/api', () => ({
  apiFetch: (...args: unknown[]) => apiFetchMock(...args),
  queryClient: {
    invalidateQueries: (...args: unknown[]) => invalidateQueriesMock(...args),
  },
}))

import { accountApi } from './account/api'
import { categoryApi } from './category/api'
import { exchangeRateApi } from './exchange-rate/api'
import { tagApi } from './tag/api'
import { transactionApi } from './transaction/api'
import { transferApi } from './transfer/api'

describe('feature api clients', () => {
  it('builds account endpoints and invalidate call', async () => {
    await accountApi.list()
    await accountApi.summary()
    await accountApi.getById('acc-1')
    await accountApi.create({ name: 'Main' } as never)
    await accountApi.update('acc-2', { name: 'Updated' } as never)
    await accountApi.toggleExcluded('acc-3')
    await accountApi.reorder({ ids: ['acc-1', 'acc-2'] })
    await accountApi.delete('acc-4')
    await accountApi.invalidate()

    expect(apiFetchMock).toHaveBeenCalledWith('accounts')
    expect(apiFetchMock).toHaveBeenCalledWith('accounts/summary')
    expect(apiFetchMock).toHaveBeenCalledWith('accounts/acc-1')
    expect(apiFetchMock).toHaveBeenCalledWith(
      'accounts',
      expect.objectContaining({ method: 'POST' })
    )
    expect(apiFetchMock).toHaveBeenCalledWith(
      'accounts/acc-2',
      expect.objectContaining({ method: 'PATCH' })
    )
    expect(apiFetchMock).toHaveBeenCalledWith('accounts/excluded/acc-3', {
      method: 'PATCH',
    })
    expect(apiFetchMock).toHaveBeenCalledWith(
      'accounts/reorder',
      expect.objectContaining({ method: 'PATCH' })
    )
    expect(apiFetchMock).toHaveBeenCalledWith('accounts/acc-4', {
      method: 'DELETE',
    })
    expect(invalidateQueriesMock).toHaveBeenCalledWith({
      queryKey: ['accounts'],
    })
  })

  it('builds category endpoints and invalidation', async () => {
    await categoryApi.list()
    await categoryApi.getById('cat-1')
    await categoryApi.create({ name: 'Food' } as never)
    await categoryApi.update('cat-2', { name: 'Rent' } as never)
    await categoryApi.reorder({ ids: ['cat-1', 'cat-2'] })
    await categoryApi.invalidate()

    expect(apiFetchMock).toHaveBeenCalledWith('categories')
    expect(apiFetchMock).toHaveBeenCalledWith('categories/cat-1')
    expect(apiFetchMock).toHaveBeenCalledWith(
      'categories',
      expect.objectContaining({ method: 'POST' })
    )
    expect(apiFetchMock).toHaveBeenCalledWith(
      'categories/cat-2',
      expect.objectContaining({ method: 'PATCH' })
    )
    expect(apiFetchMock).toHaveBeenCalledWith(
      'categories/reorder',
      expect.objectContaining({ method: 'PATCH' })
    )
    expect(invalidateQueriesMock).toHaveBeenCalledWith({
      queryKey: ['categories'],
    })
  })

  it('builds transaction endpoints and passes query params', async () => {
    await transactionApi.list({ account: 'acc-1' } as never)
    await transactionApi.getById('tx-1')
    await transactionApi.create({ amount: 100 } as never)
    await transactionApi.update(
      'tx-2',
      { amount: 150 } as never,
      { recalcBalance: 'true' }
    )
    await transactionApi.delete('tx-3')
    await transactionApi.invalidate()

    expect(apiFetchMock).toHaveBeenCalledWith(
      'transactions',
      expect.objectContaining({
        params: expect.objectContaining({ account: 'acc-1' }),
      })
    )
    expect(apiFetchMock).toHaveBeenCalledWith('transactions/tx-1')
    expect(apiFetchMock).toHaveBeenCalledWith(
      'transactions',
      expect.objectContaining({ method: 'POST' })
    )
    expect(apiFetchMock).toHaveBeenCalledWith(
      'transactions/tx-2',
      expect.objectContaining({
        method: 'PATCH',
        params: { recalcBalance: 'true' },
      })
    )
    expect(apiFetchMock).toHaveBeenCalledWith('transactions/tx-3', {
      method: 'DELETE',
    })
    expect(invalidateQueriesMock).toHaveBeenCalledWith({
      queryKey: ['transactions'],
    })
  })

  it('builds transfer/tag/exchange-rate endpoints', async () => {
    await transferApi.list({ account: 'acc-1' } as never)
    await transferApi.getById('tr-1')
    await transferApi.create({ from: 'a', to: 'b' } as never)
    await transferApi.update('tr-2', { fee: 1 } as never)
    await transferApi.delete('tr-3')
    await transferApi.invalidate()

    await tagApi.list()
    await tagApi.getById('tag-1')
    await tagApi.create({ name: 'Food' } as never)
    await tagApi.update('tag-2', { name: 'Travel' } as never)
    await tagApi.delete('tag-3')
    await tagApi.invalidate()

    await exchangeRateApi.list()
    await exchangeRateApi.getByCode('USD')
    await exchangeRateApi.getById('rate-1')

    expect(apiFetchMock).toHaveBeenCalledWith(
      'transfers',
      expect.objectContaining({
        params: expect.objectContaining({ account: 'acc-1' }),
      })
    )
    expect(apiFetchMock).toHaveBeenCalledWith(
      'transfers/tr-2',
      expect.objectContaining({ method: 'PATCH' })
    )
    expect(invalidateQueriesMock).toHaveBeenCalledWith({
      queryKey: ['transfers'],
    })

    expect(apiFetchMock).toHaveBeenCalledWith('tags/tag-1')
    expect(apiFetchMock).toHaveBeenCalledWith('tags/tag-3', {
      method: 'DELETE',
    })
    expect(invalidateQueriesMock).toHaveBeenCalledWith({
      queryKey: ['tags'],
    })

    expect(apiFetchMock).toHaveBeenCalledWith('rates')
    expect(apiFetchMock).toHaveBeenCalledWith('rates/code/USD')
    expect(apiFetchMock).toHaveBeenCalledWith('rates/rate-1')
  })
})
