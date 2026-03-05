import { describe, it, expect } from 'vitest'
import { waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'

import { server } from '@/testing/server'
import { createStore } from '@/store'
import {
  createTransfer,
  deleteTransfer,
  fetchTransfers,
} from '@/store/slices/transfer'
import { mockTransfer, createMockTransfer } from '@/testing/data/transfer'

describe('Transfer flow (integration)', () => {
  it('fetchTransfers: loads list and updates store', async () => {
    const store = createStore()

    store.dispatch(fetchTransfers())

    await waitFor(
      () => {
        expect(store.getState().transfer.status).toBe('success')
      },
      { timeout: 3000 }
    )

    expect(store.getState().transfer.transfers).toHaveLength(1)
    expect(store.getState().transfer.transfers[0].id).toBe(mockTransfer.id)
  })

  it('createTransfer: API request with valid DTO, transfer added to store', async () => {
    const newTransfer = createMockTransfer({ id: 'transfer-new' })
    server.use(
      http.post('http://localhost/v1/transfers', () =>
        HttpResponse.json(newTransfer, { status: 201 })
      )
    )

    const store = createStore()

    store.dispatch(
      createTransfer({
        from: { account: 'account-1', value: 10000, scale: 2 },
        to: { account: 'account-2', value: 9100, scale: 2 },
        rate: 0.91,
      })
    )

    await waitFor(
      () => {
        expect(store.getState().transfer.status).toBe('success')
      },
      { timeout: 3000 }
    )

    expect(store.getState().transfer.transfers).toContainEqual(
      expect.objectContaining({ id: 'transfer-new' })
    )
  })

  it('deleteTransfer: API call, transfer removed from store', async () => {
    const store = createStore({
      transfer: {
        transfers: [mockTransfer, createMockTransfer({ id: 'to-delete' })],
        status: 'idle',
      },
    })

    store.dispatch(deleteTransfer('to-delete'))

    await waitFor(
      () => {
        const list = store.getState().transfer.transfers
        expect(list.some((t) => t.id === 'to-delete')).toBe(false)
      },
      { timeout: 3000 }
    )

    expect(store.getState().transfer.transfers).toHaveLength(1)
    expect(store.getState().transfer.transfers[0].id).toBe(mockTransfer.id)
  })

  it('createTransfer API error: status is failed', async () => {
    server.use(
      http.post('http://localhost/v1/transfers', () =>
        HttpResponse.json(
          { message: 'Server error', statusCode: 500 },
          { status: 500 }
        )
      )
    )

    const store = createStore()

    store.dispatch(
      createTransfer({
        from: { account: 'account-1', value: 1000, scale: 2 },
        to: { account: 'account-2', value: 900, scale: 2 },
        rate: 0.9,
      })
    )

    await waitFor(
      () => {
        expect(store.getState().transfer.status).toBe('failed')
      },
      { timeout: 3000 }
    )

    expect(store.getState().transfer.transfers).toHaveLength(0)
  })
})
