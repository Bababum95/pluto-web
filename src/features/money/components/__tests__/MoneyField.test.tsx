import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from '@/testing/render'
import { createStore } from '@/app/store'
import { createMockSettings } from '@/testing/data/settings'
import { mockCurrency } from '@/testing/data/currency'

import { MoneyField } from '../MoneyField'

describe('MoneyField', () => {
  it('renders input with value and displays currency from store', () => {
    const store = createStore({
      settings: {
        settings: createMockSettings({ currency: mockCurrency }),
        status: 'success',
      },
    })
    const onChange = vi.fn()
    renderWithProviders(
      <MoneyField
        inputProps={{ value: '100.50', onChange }}
        currency={mockCurrency.code}
      />,
      { store }
    )
    const input = screen.getByRole('textbox', { name: '' })
    expect(input).toHaveValue('100.50')
    expect(screen.getByText('USD')).toBeInTheDocument()
  })

  it('uses default currency from store when currency prop is omitted', () => {
    const store = createStore({
      settings: {
        settings: createMockSettings({ currency: mockCurrency }),
        status: 'success',
      },
    })
    renderWithProviders(
      <MoneyField inputProps={{ value: '0', onChange: vi.fn() }} />,
      { store }
    )
    expect(screen.getByText('USD')).toBeInTheDocument()
  })

  it('calls onChange when user types', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const store = createStore({
      settings: {
        settings: createMockSettings(),
        status: 'success',
      },
    })
    renderWithProviders(<MoneyField inputProps={{ value: '', onChange }} />, {
      store,
    })
    const input = screen.getByRole('textbox')
    await user.type(input, '5')
    expect(onChange).toHaveBeenCalled()
  })

  it('shows clear button when value is not empty', () => {
    const onChange = vi.fn()
    const store = createStore({
      settings: {
        settings: createMockSettings(),
        status: 'success',
      },
    })
    renderWithProviders(<MoneyField inputProps={{ value: '99', onChange }} />, {
      store,
    })
    const clearButton = screen.getByRole('button', { name: '' })
    expect(clearButton).toBeInTheDocument()
  })

  it('calls onChange with empty string when clear button is clicked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const store = createStore({
      settings: {
        settings: createMockSettings(),
        status: 'success',
      },
    })
    renderWithProviders(<MoneyField inputProps={{ value: '42', onChange }} />, {
      store,
    })
    const clearButton = screen.getByRole('button', { name: '' })
    await user.click(clearButton)
    expect(onChange).toHaveBeenCalledWith('')
  })

  it('renders preset buttons with multiplied amounts for empty input', () => {
    const store = createStore({
      settings: {
        settings: createMockSettings(),
        status: 'success',
      },
    })
    renderWithProviders(
      <MoneyField inputProps={{ value: '', onChange: vi.fn() }} />,
      { store }
    )
    expect(screen.getByRole('button', { name: '1 000' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '10 000' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '100 000' })).toBeInTheDocument()
  })

  it('updates preset button labels based on current input value', () => {
    const store = createStore({
      settings: {
        settings: createMockSettings(),
        status: 'success',
      },
    })
    renderWithProviders(
      <MoneyField inputProps={{ value: '100', onChange: vi.fn() }} />,
      { store }
    )
    expect(screen.getByRole('button', { name: '100 000' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '1 000 000' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '10 000 000' })).toBeInTheDocument()
  })

  it('calls onChange with multiplied amount when preset button is clicked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const store = createStore({
      settings: {
        settings: createMockSettings(),
        status: 'success',
      },
    })
    renderWithProviders(
      <MoneyField inputProps={{ value: '25', onChange }} />,
      { store }
    )
    await user.click(screen.getByRole('button', { name: '25 000' }))
    expect(onChange).toHaveBeenCalledWith('25000')
  })

  it('displays error message when isError is true', () => {
    const store = createStore({
      settings: {
        settings: createMockSettings(),
        status: 'success',
      },
    })
    renderWithProviders(
      <MoneyField
        inputProps={{ value: '', onChange: vi.fn() }}
        isError
        errorMessage="Amount is required"
      />,
      { store }
    )
    expect(screen.getByText('Amount is required')).toBeInTheDocument()
  })
})
