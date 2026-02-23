import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

import { Label } from './label'

describe('Label', () => {
  it('renders children', () => {
    render(<Label>Email</Label>)
    expect(screen.getByText('Email')).toBeInTheDocument()
  })

  it('applies data-slot attribute', () => {
    render(<Label data-testid="label">Name</Label>)
    expect(screen.getByTestId('label')).toHaveAttribute('data-slot', 'label')
  })

  it('renders as a label element', () => {
    render(<Label>Test</Label>)
    expect(screen.getByText('Test').tagName).toBe('LABEL')
  })

  it('applies htmlFor attribute', () => {
    render(<Label htmlFor="email-field">Email</Label>)
    expect(screen.getByText('Email')).toHaveAttribute('for', 'email-field')
  })

  it('applies custom className', () => {
    render(<Label className="custom" data-testid="label">Text</Label>)
    expect(screen.getByTestId('label')).toHaveClass('custom')
  })
})
