import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'

import { DatePickerRange } from './date-picker-range'

describe('DatePickerRange', () => {
  it('renders trigger button', () => {
    const onChange = vi.fn()
    render(<DatePickerRange onChange={onChange} />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('displays formatted range when value has from and to', () => {
    const onChange = vi.fn()
    render(
      <DatePickerRange
        onChange={onChange}
        value={{
          from: new Date(2025, 0, 10),
          to: new Date(2025, 0, 20),
        }}
      />
    )
    const trigger = screen.getByRole('button')
    expect(trigger).toHaveTextContent('2025-01-10')
    expect(trigger).toHaveTextContent('2025-01-20')
  })

  it('calls onChange when a day is selected in the calendar', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<DatePickerRange onChange={onChange} />)
    await user.click(screen.getByRole('button'))
    const buttons = screen.getAllByRole('button')
    const dayButton = buttons.find(
      (b) =>
        b.hasAttribute('data-day') &&
        b.getAttribute('aria-disabled') !== 'true'
    )
    if (dayButton) {
      await user.click(dayButton)
      expect(onChange).toHaveBeenCalled()
    }
  })
})
