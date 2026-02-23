import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

import { Field, FieldLabel, FieldDescription, FieldError, FieldGroup } from './field'

describe('Field', () => {
  it('renders as a group', () => {
    render(<Field>Content</Field>)
    expect(screen.getByRole('group')).toBeInTheDocument()
  })

  it('applies data-slot attribute', () => {
    render(<Field data-testid="field">Content</Field>)
    expect(screen.getByTestId('field')).toHaveAttribute('data-slot', 'field')
  })

  it('applies orientation', () => {
    render(
      <Field orientation="horizontal" data-testid="field">
        Content
      </Field>
    )
    expect(screen.getByTestId('field')).toHaveAttribute(
      'data-orientation',
      'horizontal'
    )
  })
})

describe('FieldLabel', () => {
  it('renders as a label', () => {
    render(<FieldLabel>Email</FieldLabel>)
    expect(screen.getByText('Email').tagName).toBe('LABEL')
  })
})

describe('FieldDescription', () => {
  it('renders description text', () => {
    render(<FieldDescription>Help text</FieldDescription>)
    expect(screen.getByText('Help text')).toBeInTheDocument()
  })

  it('applies data-slot', () => {
    render(<FieldDescription data-testid="desc">Text</FieldDescription>)
    expect(screen.getByTestId('desc')).toHaveAttribute(
      'data-slot',
      'field-description'
    )
  })
})

describe('FieldError', () => {
  it('renders error message', () => {
    render(<FieldError>Required</FieldError>)
    expect(screen.getByRole('alert')).toHaveTextContent('Required')
  })

  it('renders nothing when no children and no errors', () => {
    const { container } = render(<FieldError />)
    expect(container.innerHTML).toBe('')
  })

  it('renders errors from errors prop', () => {
    render(<FieldError errors={[{ message: 'Too short' }]} />)
    expect(screen.getByRole('alert')).toHaveTextContent('Too short')
  })

  it('renders deduplicated error list', () => {
    render(
      <FieldError
        errors={[
          { message: 'Error 1' },
          { message: 'Error 2' },
          { message: 'Error 1' },
        ]}
      />
    )
    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('Error 1')
    expect(alert).toHaveTextContent('Error 2')
  })
})

describe('FieldGroup', () => {
  it('renders with data-slot', () => {
    render(<FieldGroup data-testid="fg">Fields</FieldGroup>)
    expect(screen.getByTestId('fg')).toHaveAttribute(
      'data-slot',
      'field-group'
    )
  })
})
