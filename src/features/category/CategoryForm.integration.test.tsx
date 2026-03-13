import { describe, it, expect } from 'vitest'
import { waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'

import { renderWithProviders } from '@/testing/render'
import { server } from '@/testing/server'
import { createStore } from '@/store'
import { createCategory } from '@/store/slices/category'
import { TransactionTypeTabs } from '@/features/transaction-type'
import { CategoryForm } from '@/features/category'
import { mockCategory, createMockCategory } from '@/testing/data/category'

describe('CategoryForm (integration)', () => {
  it('submit: fills name, calls POST /categories, store updated on success', async () => {
    const newCategory = createMockCategory({
      id: 'category-new',
      name: 'Transport',
    })
    server.use(
      http.post('http://localhost/v1/categories', async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>
        expect(body.name).toBe('Transport')
        expect(body.type).toBe('expense')
        return HttpResponse.json(newCategory)
      })
    )

    const store = createStore({
      category: { categories: [mockCategory], status: 'idle' },
      transactionType: { transactionType: 'expense' },
    })

    const user = userEvent.setup()
    const { getByRole, getByLabelText } = renderWithProviders(
      <TransactionTypeTabs>
        <CategoryForm
          defaultValues={{
            name: '',
            color: '#00a4e8',
            icon: 'wallet',
          }}
          onSubmit={async (values) => {
            await store.dispatch(createCategory(values))
          }}
        />
      </TransactionTypeTabs>,
      { store }
    )

    await user.type(getByLabelText('Category name'), 'Transport')
    await user.click(getByRole('button', { name: 'Create' }))

    await waitFor(
      () => {
        const categories = store.getState().category.categories
        expect(categories.some((c) => c.id === 'category-new')).toBe(true)
        expect(categories.find((c) => c.id === 'category-new')?.name).toBe(
          'Transport'
        )
      },
      { timeout: 3000 }
    )
  })

  it('submit: API error does not add category', async () => {
    server.use(
      http.post('http://localhost/v1/categories', () =>
        HttpResponse.json(
          { message: 'Server error', statusCode: 500 },
          { status: 500 }
        )
      )
    )

    const store = createStore({
      category: { categories: [mockCategory], status: 'idle' },
      transactionType: { transactionType: 'expense' },
    })

    const user = userEvent.setup()
    const { getByRole, getByLabelText } = renderWithProviders(
      <TransactionTypeTabs>
        <CategoryForm
          defaultValues={{
            name: '',
            color: '#00a4e8',
            icon: 'wallet',
          }}
          onSubmit={async (values) => {
            await store.dispatch(createCategory(values))
          }}
        />
      </TransactionTypeTabs>,
      { store }
    )

    await user.type(getByLabelText('Category name'), 'Fail')
    await user.click(getByRole('button', { name: 'Create' }))

    await waitFor(() => {
      expect(store.getState().category.categories).toHaveLength(1)
      expect(store.getState().category.status).toBe('failed')
    })
  })
})
