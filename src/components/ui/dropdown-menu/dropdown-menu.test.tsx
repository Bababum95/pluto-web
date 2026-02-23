import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu'

describe('DropdownMenu', () => {
  const renderMenu = () =>
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Edit</DropdownMenuItem>
          <DropdownMenuItem>Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )

  it('renders trigger button', () => {
    renderMenu()
    expect(screen.getByText('Open')).toBeInTheDocument()
  })

  it('opens on trigger click', async () => {
    const user = userEvent.setup()
    renderMenu()
    await user.click(screen.getByText('Open'))
    expect(screen.getByText('Edit')).toBeInTheDocument()
    expect(screen.getByText('Delete')).toBeInTheDocument()
  })

  it('renders menu label', async () => {
    const user = userEvent.setup()
    renderMenu()
    await user.click(screen.getByText('Open'))
    expect(screen.getByText('Actions')).toBeInTheDocument()
  })

  it('renders separator', async () => {
    const user = userEvent.setup()
    renderMenu()
    await user.click(screen.getByText('Open'))
    expect(screen.getByRole('separator')).toBeInTheDocument()
  })
})
