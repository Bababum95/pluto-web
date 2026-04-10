import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Switch } from './switch'

describe('Switch', () => {
  it('renders a switch element', () => {
    render(<Switch aria-label="Enable feature" />)
    expect(screen.getByRole('switch', { name: 'Enable feature' })).toBeInTheDocument()
  })

  it('supports checked state', () => {
    render(<Switch aria-label="Checked switch" checked />)
    expect(screen.getByRole('switch', { name: 'Checked switch' })).toHaveAttribute(
      'data-state',
      'checked'
    )
  })

  it('handles toggle events', async () => {
    const user = userEvent.setup()
    const onCheckedChange = vi.fn()

    render(
      <Switch aria-label="Interactive switch" onCheckedChange={onCheckedChange} />
    )

    await user.click(screen.getByRole('switch', { name: 'Interactive switch' }))

    expect(onCheckedChange).toHaveBeenCalledOnce()
    expect(onCheckedChange).toHaveBeenCalledWith(true)
  })

  it('can be disabled', async () => {
    const user = userEvent.setup()
    const onCheckedChange = vi.fn()

    render(
      <Switch
        aria-label="Disabled switch"
        disabled
        onCheckedChange={onCheckedChange}
      />
    )

    const switchElement = screen.getByRole('switch', { name: 'Disabled switch' })

    expect(switchElement).toBeDisabled()
    await user.click(switchElement)
    expect(onCheckedChange).not.toHaveBeenCalled()
  })

  it('applies custom className', () => {
    render(<Switch aria-label="Styled switch" className="test-class" />)
    expect(screen.getByRole('switch', { name: 'Styled switch' })).toHaveClass('test-class')
  })
})
