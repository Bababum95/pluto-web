import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

import {
  Item,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemActions,
  ItemGroup,
  ItemSeparator,
  ItemMedia,
} from './item'

describe('Item', () => {
  it('renders children', () => {
    render(<Item>Content</Item>)
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('applies data-slot attribute', () => {
    render(<Item data-testid="item">Content</Item>)
    expect(screen.getByTestId('item')).toHaveAttribute('data-slot', 'item')
  })

  it('applies variant attribute', () => {
    render(
      <Item variant="outline" data-testid="item">
        Content
      </Item>
    )
    expect(screen.getByTestId('item')).toHaveAttribute(
      'data-variant',
      'outline'
    )
  })

  it('applies size attribute', () => {
    render(
      <Item size="sm" data-testid="item">
        Content
      </Item>
    )
    expect(screen.getByTestId('item')).toHaveAttribute('data-size', 'sm')
  })
})

describe('ItemContent', () => {
  it('renders with data-slot', () => {
    render(<ItemContent data-testid="ic">Body</ItemContent>)
    expect(screen.getByTestId('ic')).toHaveAttribute(
      'data-slot',
      'item-content'
    )
  })
})

describe('ItemTitle', () => {
  it('renders title', () => {
    render(<ItemTitle>Title</ItemTitle>)
    expect(screen.getByText('Title')).toBeInTheDocument()
  })
})

describe('ItemDescription', () => {
  it('renders description', () => {
    render(<ItemDescription>Desc</ItemDescription>)
    expect(screen.getByText('Desc')).toBeInTheDocument()
  })
})

describe('ItemActions', () => {
  it('renders actions', () => {
    render(<ItemActions data-testid="ia">Actions</ItemActions>)
    expect(screen.getByTestId('ia')).toHaveAttribute(
      'data-slot',
      'item-actions'
    )
  })
})

describe('ItemGroup', () => {
  it('renders with list role', () => {
    render(<ItemGroup>Items</ItemGroup>)
    expect(screen.getByRole('list')).toBeInTheDocument()
  })
})

describe('ItemSeparator', () => {
  it('renders separator', () => {
    render(<ItemSeparator data-testid="is" />)
    expect(screen.getByTestId('is')).toHaveAttribute(
      'data-slot',
      'item-separator'
    )
  })
})

describe('ItemMedia', () => {
  it('renders with variant', () => {
    render(
      <ItemMedia variant="icon" data-testid="im">
        Icon
      </ItemMedia>
    )
    expect(screen.getByTestId('im')).toHaveAttribute('data-variant', 'icon')
  })
})
