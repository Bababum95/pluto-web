import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
} from './empty'

describe('Empty', () => {
  it('renders with data-slot attribute', () => {
    render(<Empty data-testid="empty" />)
    expect(screen.getByTestId('empty')).toHaveAttribute('data-slot', 'empty')
  })

  it('applies custom className', () => {
    render(<Empty className="custom-class" data-testid="empty" />)
    expect(screen.getByTestId('empty')).toHaveClass('custom-class')
  })

  it('renders children', () => {
    render(<Empty data-testid="empty">Child content</Empty>)
    expect(screen.getByTestId('empty')).toHaveTextContent('Child content')
  })
})

describe('EmptyHeader', () => {
  it('renders with data-slot attribute', () => {
    render(<EmptyHeader data-testid="header" />)
    expect(screen.getByTestId('header')).toHaveAttribute(
      'data-slot',
      'empty-header'
    )
  })
})

describe('EmptyTitle', () => {
  it('renders with data-slot attribute', () => {
    render(<EmptyTitle data-testid="title">Title</EmptyTitle>)
    expect(screen.getByTestId('title')).toHaveAttribute(
      'data-slot',
      'empty-title'
    )
    expect(screen.getByTestId('title')).toHaveTextContent('Title')
  })
})

describe('EmptyDescription', () => {
  it('renders with data-slot attribute', () => {
    render(
      <EmptyDescription data-testid="desc">Description</EmptyDescription>
    )
    expect(screen.getByTestId('desc')).toHaveAttribute(
      'data-slot',
      'empty-description'
    )
  })
})

describe('EmptyContent', () => {
  it('renders with data-slot attribute', () => {
    render(<EmptyContent data-testid="content" />)
    expect(screen.getByTestId('content')).toHaveAttribute(
      'data-slot',
      'empty-content'
    )
  })
})

describe('EmptyMedia', () => {
  it('renders with default variant', () => {
    render(<EmptyMedia data-testid="media" />)
    expect(screen.getByTestId('media')).toHaveAttribute(
      'data-slot',
      'empty-icon'
    )
    expect(screen.getByTestId('media')).toHaveAttribute(
      'data-variant',
      'default'
    )
  })

  it('renders with icon variant', () => {
    render(<EmptyMedia data-testid="media" variant="icon" />)
    expect(screen.getByTestId('media')).toHaveAttribute('data-variant', 'icon')
  })
})
