import { useEffect } from 'react'
import { describe, it, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'

import { renderWithProviders } from '@/testing/render'
import { server } from '@/testing/server'
import { initApp } from '@/store/slices/app'
import { selectTransactionsByCategory } from '@/store/slices/transaction'
import { useAppDispatch, useAppSelector } from '@/store'
import { mockCategory, mockTransaction } from '@/testing/data'

/** Minimal component that loads app data and displays first category (no router/Link). */
function HomeDataConsumer() {
  const dispatch = useAppDispatch()
  const byCategory = useAppSelector(selectTransactionsByCategory)

  useEffect(() => {
    dispatch(initApp())
  }, [dispatch])

  const first = byCategory[0]
  return (
    <div>
      {first ? (
        <span data-testid="category-name">{first.category.name}</span>
      ) : (
        <span data-testid="loading">loading</span>
      )}
    </div>
  )
}

describe('Home data flow (integration)', () => {
  it('loads and displays transaction data after initApp', async () => {
    const { store } = renderWithProviders(<HomeDataConsumer />)

    await waitFor(
      () => {
        expect(store.getState().app.status).toBe('success')
      },
      { timeout: 3000 }
    )

    expect(store.getState().transaction.transactions).toHaveLength(1)
    expect(store.getState().transaction.transactions[0].id).toBe(
      mockTransaction.id
    )

    expect(screen.getByTestId('category-name')).toHaveTextContent(
      mockCategory.name
    )
  })

  it('handles API failure: transactions 500 leads to failed state', async () => {
    server.use(
      http.get(/http:\/\/localhost\/v1\/transactions/, () =>
        HttpResponse.json(
          { message: 'Server error', statusCode: 500 },
          { status: 500 }
        )
      )
    )

    const { store } = renderWithProviders(<HomeDataConsumer />)

    await waitFor(
      () => {
        const txStatus = store.getState().transaction.status
        expect(txStatus).toBe('failed')
      },
      { timeout: 3000 }
    )
  })
})
