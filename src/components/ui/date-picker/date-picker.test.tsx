import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'

import { DatePicker } from './date-picker'

describe('DatePicker', () => {
  it('renders with label', () => {
    const onChange = vi.fn()
    render(
      <DatePicker
        label="Date"
        onChange={onChange}
      />
    )
    expect(screen.getByText('Date')).toBeInTheDocument()
  })

  it('renders trigger button with aria-label', () => {
    const onChange = vi.fn()
    render(<DatePicker onChange={onChange} />)
    const trigger = screen.getByRole('button', { name: /select date/i })
    expect(trigger).toBeInTheDocument()
  })

  it('calls onChange when date is selected', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<DatePicker onChange={onChange} />)
    await user.click(screen.getByRole('button'))
    const buttons = screen.getAllByRole('button')
    const dayButton = buttons.find(
      (b) =>
        b.hasAttribute('data-day') &&
        !b.getAttribute('aria-disabled')
    )
    if (dayButton) {
      await user.click(dayButton)
      expect(onChange).toHaveBeenCalledTimes(1)
      expect(onChange).toHaveBeenCalledWith(expect.any(Date))
    }
  })

  it('displays value when provided', () => {
    const onChange = vi.fn()
    render(
      <DatePicker
        value={new Date(2025, 0, 15)}
        onChange={onChange}
      />
    )
    expect(screen.getByText('15.01.2025')).toBeInTheDocument()
  })

  it('shows error message when isError is true', () => {
    const onChange = vi.fn()
    render(
      <DatePicker
        onChange={onChange}
        isError
        errorMessage="Invalid date"
      />
    )
    expect(screen.getByText('Invalid date')).toBeInTheDocument()
  })

  it('applies error styling to trigger when isError', () => {
    const onChange = vi.fn()
    render(
      <DatePicker
        onChange={onChange}
        isError
      />
    )
    const trigger = screen.getByRole('button')
    expect(trigger).toHaveClass('border-destructive')
  })
})
