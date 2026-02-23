import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

import { InputGroup, InputGroupAddon, InputGroupInput } from './input-group'

describe('InputGroup', () => {
  it('renders as a group', () => {
    render(
      <InputGroup>
        <InputGroupInput placeholder="Type..." />
      </InputGroup>
    )
    expect(screen.getByRole('group')).toBeInTheDocument()
  })

  it('applies data-slot attribute', () => {
    render(
      <InputGroup data-testid="ig">
        <InputGroupInput />
      </InputGroup>
    )
    expect(screen.getByTestId('ig')).toHaveAttribute(
      'data-slot',
      'input-group'
    )
  })

  it('renders input inside group', () => {
    render(
      <InputGroup>
        <InputGroupInput placeholder="Test" />
      </InputGroup>
    )
    expect(screen.getByPlaceholderText('Test')).toBeInTheDocument()
  })

  it('renders addon', () => {
    render(
      <InputGroup>
        <InputGroupAddon>$</InputGroupAddon>
        <InputGroupInput />
      </InputGroup>
    )
    expect(screen.getByText('$')).toBeInTheDocument()
  })

  it('applies align attribute on addon', () => {
    render(
      <InputGroup>
        <InputGroupAddon align="inline-end" data-testid="addon">
          USD
        </InputGroupAddon>
        <InputGroupInput />
      </InputGroup>
    )
    expect(screen.getByTestId('addon')).toHaveAttribute(
      'data-align',
      'inline-end'
    )
  })
})
