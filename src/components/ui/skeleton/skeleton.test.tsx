import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

import { Skeleton } from './skeleton'

describe('Skeleton', () => {
  it('renders a div element', () => {
    render(<Skeleton data-testid="skel" />)
    expect(screen.getByTestId('skel').tagName).toBe('DIV')
  })

  it('applies data-slot attribute', () => {
    render(<Skeleton data-testid="skel" />)
    expect(screen.getByTestId('skel')).toHaveAttribute('data-slot', 'skeleton')
  })

  it('has animate-pulse class', () => {
    render(<Skeleton data-testid="skel" />)
    expect(screen.getByTestId('skel')).toHaveClass('animate-pulse')
  })

  it('applies custom className', () => {
    render(<Skeleton className="h-4 w-48" data-testid="skel" />)
    const el = screen.getByTestId('skel')
    expect(el).toHaveClass('h-4')
    expect(el).toHaveClass('w-48')
  })

  it('passes extra props', () => {
    render(<Skeleton data-testid="skel" role="progressbar" />)
    expect(screen.getByTestId('skel')).toHaveAttribute('role', 'progressbar')
  })
})
