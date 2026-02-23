import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

import { Spinner } from './spinner'

describe('Spinner', () => {
  it('renders with status role', () => {
    render(<Spinner />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('has accessible label', () => {
    render(<Spinner />)
    expect(screen.getByLabelText('Loading')).toBeInTheDocument()
  })

  it('has animate-spin class', () => {
    render(<Spinner />)
    expect(screen.getByRole('status')).toHaveClass('animate-spin')
  })

  it('applies custom className', () => {
    render(<Spinner className="size-8" />)
    expect(screen.getByRole('status')).toHaveClass('size-8')
  })
})
