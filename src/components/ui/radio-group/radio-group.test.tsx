import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

import { RadioGroup, RadioGroupItem } from './radio-group'

describe('RadioGroup', () => {
  it('renders a radiogroup', () => {
    render(
      <RadioGroup>
        <RadioGroupItem value="a" />
        <RadioGroupItem value="b" />
      </RadioGroup>
    )
    expect(screen.getByRole('radiogroup')).toBeInTheDocument()
  })

  it('renders radio items', () => {
    render(
      <RadioGroup>
        <RadioGroupItem value="a" />
        <RadioGroupItem value="b" />
      </RadioGroup>
    )
    expect(screen.getAllByRole('radio')).toHaveLength(2)
  })

  it('applies data-slot to group', () => {
    render(
      <RadioGroup data-testid="rg">
        <RadioGroupItem value="a" />
      </RadioGroup>
    )
    expect(screen.getByTestId('rg')).toHaveAttribute(
      'data-slot',
      'radio-group'
    )
  })

  it('supports default value', () => {
    render(
      <RadioGroup defaultValue="b">
        <RadioGroupItem value="a" />
        <RadioGroupItem value="b" />
      </RadioGroup>
    )
    const radios = screen.getAllByRole('radio')
    expect(radios[1]).toHaveAttribute('data-state', 'checked')
  })

  it('supports disabled items', () => {
    render(
      <RadioGroup>
        <RadioGroupItem value="a" disabled />
      </RadioGroup>
    )
    expect(screen.getByRole('radio')).toBeDisabled()
  })
})
