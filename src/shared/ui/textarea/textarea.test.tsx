import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'

import { Textarea } from './textarea'

describe('Textarea', () => {
  it('renders a textarea element', () => {
    render(<Textarea placeholder="Type here" />)
    expect(screen.getByPlaceholderText('Type here')).toBeInTheDocument()
  })

  it('applies data-slot attribute', () => {
    render(<Textarea data-testid="ta" />)
    expect(screen.getByTestId('ta')).toHaveAttribute('data-slot', 'textarea')
  })

  it('handles value changes', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Textarea onChange={onChange} />)
    await user.type(screen.getByRole('textbox'), 'text')
    expect(onChange).toHaveBeenCalled()
  })

  it('can be disabled', () => {
    render(<Textarea disabled />)
    expect(screen.getByRole('textbox')).toBeDisabled()
  })

  it('applies custom className', () => {
    render(<Textarea className="custom" data-testid="ta" />)
    expect(screen.getByTestId('ta')).toHaveClass('custom')
  })

  it('renders with default value', () => {
    render(<Textarea defaultValue="initial text" />)
    expect(screen.getByRole('textbox')).toHaveValue('initial text')
  })
})
