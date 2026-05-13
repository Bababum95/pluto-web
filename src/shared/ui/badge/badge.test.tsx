import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

import { Badge } from './badge'

describe('Badge', () => {
  it('renders children', () => {
    render(<Badge>New</Badge>)
    expect(screen.getByText('New')).toBeInTheDocument()
  })

  it('renders as a span by default', () => {
    render(<Badge>Tag</Badge>)
    expect(screen.getByText('Tag').tagName).toBe('SPAN')
  })

  it('applies data-slot attribute', () => {
    render(<Badge>Slot</Badge>)
    expect(screen.getByText('Slot')).toHaveAttribute('data-slot', 'badge')
  })

  it('applies data-variant attribute', () => {
    render(<Badge variant="destructive">Error</Badge>)
    expect(screen.getByText('Error')).toHaveAttribute(
      'data-variant',
      'destructive'
    )
  })

  it('defaults to "default" variant', () => {
    render(<Badge>Default</Badge>)
    expect(screen.getByText('Default')).toHaveAttribute(
      'data-variant',
      'default'
    )
  })

  it('applies custom className', () => {
    render(<Badge className="custom-class">Styled</Badge>)
    expect(screen.getByText('Styled')).toHaveClass('custom-class')
  })

  it('applies inline backgroundColor for default variant with color prop', () => {
    render(
      <Badge variant="default" color="#ff0000">
        Red
      </Badge>
    )
    const el = screen.getByText('Red')
    expect(el.style.backgroundColor).toBe('rgb(255, 0, 0)')
    expect(el.style.borderColor).toBe('rgb(255, 0, 0)')
  })

  it('applies inline color for outline variant with color prop', () => {
    render(
      <Badge variant="outline" color="#00ff00">
        Green
      </Badge>
    )
    const el = screen.getByText('Green')
    expect(el.style.color).toBe('rgb(0, 255, 0)')
    expect(el.style.borderColor).toBe('rgb(0, 255, 0)')
  })

  it('does not set backgroundColor for outline variant with color prop', () => {
    render(
      <Badge variant="outline" color="#00ff00">
        Green
      </Badge>
    )
    expect(screen.getByText('Green').style.backgroundColor).toBe('')
  })

  it('passes extra props to the underlying element', () => {
    render(<Badge data-testid="my-badge">Test</Badge>)
    expect(screen.getByTestId('my-badge')).toBeInTheDocument()
  })
})
