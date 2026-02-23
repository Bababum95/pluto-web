import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from './card'

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Card content</Card>)
    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  it('applies data-slot attribute', () => {
    render(<Card data-testid="card">Content</Card>)
    expect(screen.getByTestId('card')).toHaveAttribute('data-slot', 'card')
  })

  it('applies data-size attribute', () => {
    render(<Card data-testid="card" size="sm">Small</Card>)
    expect(screen.getByTestId('card')).toHaveAttribute('data-size', 'sm')
  })

  it('applies custom className', () => {
    render(<Card className="custom" data-testid="card">Styled</Card>)
    expect(screen.getByTestId('card')).toHaveClass('custom')
  })
})

describe('CardHeader', () => {
  it('renders with data-slot', () => {
    render(<CardHeader data-testid="header">Header</CardHeader>)
    expect(screen.getByTestId('header')).toHaveAttribute(
      'data-slot',
      'card-header'
    )
  })
})

describe('CardTitle', () => {
  it('renders title text', () => {
    render(<CardTitle>My Title</CardTitle>)
    expect(screen.getByText('My Title')).toBeInTheDocument()
  })

  it('has correct data-slot', () => {
    render(<CardTitle data-testid="title">Title</CardTitle>)
    expect(screen.getByTestId('title')).toHaveAttribute(
      'data-slot',
      'card-title'
    )
  })
})

describe('CardDescription', () => {
  it('renders description text', () => {
    render(<CardDescription>Description</CardDescription>)
    expect(screen.getByText('Description')).toBeInTheDocument()
  })
})

describe('CardContent', () => {
  it('renders content', () => {
    render(<CardContent>Body</CardContent>)
    expect(screen.getByText('Body')).toBeInTheDocument()
  })

  it('has correct data-slot', () => {
    render(<CardContent data-testid="content">Body</CardContent>)
    expect(screen.getByTestId('content')).toHaveAttribute(
      'data-slot',
      'card-content'
    )
  })
})

describe('CardFooter', () => {
  it('renders footer', () => {
    render(<CardFooter>Footer</CardFooter>)
    expect(screen.getByText('Footer')).toBeInTheDocument()
  })
})

describe('CardAction', () => {
  it('renders action slot', () => {
    render(<CardAction data-testid="action">Action</CardAction>)
    expect(screen.getByTestId('action')).toHaveAttribute(
      'data-slot',
      'card-action'
    )
  })
})
