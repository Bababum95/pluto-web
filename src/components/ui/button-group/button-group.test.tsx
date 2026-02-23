import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

import { ButtonGroup } from './button-group'

describe('ButtonGroup', () => {
  it('renders children', () => {
    render(
      <ButtonGroup>
        <button>A</button>
        <button>B</button>
      </ButtonGroup>
    )
    expect(screen.getByRole('group')).toBeInTheDocument()
    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.getByText('B')).toBeInTheDocument()
  })

  it('applies data-slot attribute', () => {
    render(
      <ButtonGroup data-testid="bg">
        <button>A</button>
      </ButtonGroup>
    )
    expect(screen.getByTestId('bg')).toHaveAttribute(
      'data-slot',
      'button-group'
    )
  })

  it('applies horizontal orientation when explicitly set', () => {
    render(
      <ButtonGroup orientation="horizontal" data-testid="bg">
        <button>A</button>
      </ButtonGroup>
    )
    expect(screen.getByTestId('bg')).toHaveAttribute(
      'data-orientation',
      'horizontal'
    )
  })

  it('applies vertical orientation', () => {
    render(
      <ButtonGroup orientation="vertical" data-testid="bg">
        <button>A</button>
      </ButtonGroup>
    )
    expect(screen.getByTestId('bg')).toHaveAttribute(
      'data-orientation',
      'vertical'
    )
  })

  it('applies custom className', () => {
    render(
      <ButtonGroup className="custom" data-testid="bg">
        <button>A</button>
      </ButtonGroup>
    )
    expect(screen.getByTestId('bg')).toHaveClass('custom')
  })
})
