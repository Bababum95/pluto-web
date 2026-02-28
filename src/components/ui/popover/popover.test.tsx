import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverHeader,
  PopoverTitle,
  PopoverDescription,
} from './popover'
import { Button } from '@/components/ui/button'

describe('Popover', () => {
  it('renders trigger and opens content on click', async () => {
    const user = userEvent.setup()
    render(
      <Popover>
        <PopoverTrigger asChild>
          <Button>Open</Button>
        </PopoverTrigger>
        <PopoverContent>Content</PopoverContent>
      </Popover>
    )
    expect(screen.getByRole('button', { name: 'Open' })).toBeInTheDocument()
    await user.click(screen.getByRole('button'))
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('applies data-slot to root when open', async () => {
    const user = userEvent.setup()
    render(
      <Popover>
        <PopoverTrigger asChild>
          <Button>Open</Button>
        </PopoverTrigger>
        <PopoverContent data-testid="popover-content">Content</PopoverContent>
      </Popover>
    )
    await user.click(screen.getByRole('button'))
    const content = screen.getByTestId('popover-content')
    expect(content).toHaveAttribute('data-slot', 'popover-content')
  })
})

describe('PopoverHeader', () => {
  it('renders with data-slot', () => {
    render(
      <Popover defaultOpen>
        <PopoverTrigger asChild>
          <Button>Open</Button>
        </PopoverTrigger>
        <PopoverContent>
          <PopoverHeader data-testid="header">
            <PopoverTitle>Title</PopoverTitle>
          </PopoverHeader>
        </PopoverContent>
      </Popover>
    )
    const header = screen.getByTestId('header')
    expect(header).toHaveAttribute('data-slot', 'popover-header')
  })
})

describe('PopoverTitle', () => {
  it('renders title text', async () => {
    const user = userEvent.setup()
    render(
      <Popover>
        <PopoverTrigger asChild>
          <Button>Open</Button>
        </PopoverTrigger>
        <PopoverContent>
          <PopoverHeader>
            <PopoverTitle>My Title</PopoverTitle>
            <PopoverDescription>Description</PopoverDescription>
          </PopoverHeader>
        </PopoverContent>
      </Popover>
    )
    await user.click(screen.getByRole('button'))
    expect(screen.getByText('My Title')).toBeInTheDocument()
    expect(screen.getByText('Description')).toBeInTheDocument()
  })
})
