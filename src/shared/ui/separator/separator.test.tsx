import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

import { Separator } from './separator'

describe('Separator', () => {
  it('renders a separator', () => {
    render(<Separator data-testid="sep" />)
    expect(screen.getByTestId('sep')).toBeInTheDocument()
  })

  it('applies data-slot attribute', () => {
    render(<Separator data-testid="sep" />)
    expect(screen.getByTestId('sep')).toHaveAttribute('data-slot', 'separator')
  })

  it('defaults to horizontal orientation', () => {
    render(<Separator data-testid="sep" />)
    expect(screen.getByTestId('sep')).toHaveAttribute(
      'data-orientation',
      'horizontal'
    )
  })

  it('supports vertical orientation', () => {
    render(<Separator orientation="vertical" data-testid="sep" />)
    expect(screen.getByTestId('sep')).toHaveAttribute(
      'data-orientation',
      'vertical'
    )
  })

  it('is decorative by default (role=none)', () => {
    render(<Separator data-testid="sep" />)
    expect(screen.getByTestId('sep')).toHaveAttribute('role', 'none')
  })

  it('applies custom className', () => {
    render(<Separator className="my-sep" data-testid="sep" />)
    expect(screen.getByTestId('sep')).toHaveClass('my-sep')
  })
})
