import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './alert-dialog'

describe('AlertDialog', () => {
  const renderDialog = () =>
    render(
      <AlertDialog>
        <AlertDialogTrigger>Open</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm</AlertDialogTitle>
            <AlertDialogDescription>Are you sure?</AlertDialogDescription>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>
    )

  it('renders trigger', () => {
    renderDialog()
    expect(screen.getByText('Open')).toBeInTheDocument()
  })

  it('opens on trigger click and shows title', async () => {
    const user = userEvent.setup()
    renderDialog()
    await user.click(screen.getByText('Open'))
    expect(screen.getByText('Confirm')).toBeInTheDocument()
  })

  it('shows description when open', async () => {
    const user = userEvent.setup()
    renderDialog()
    await user.click(screen.getByText('Open'))
    expect(screen.getByText('Are you sure?')).toBeInTheDocument()
  })

  it('applies data-slot on content', async () => {
    const user = userEvent.setup()
    renderDialog()
    await user.click(screen.getByText('Open'))
    const title = screen.getByText('Confirm')
    expect(title.closest('[data-slot="alert-dialog-content"]')).toBeTruthy()
  })
})
