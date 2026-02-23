import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'

import { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs'

describe('Tabs', () => {
  const renderTabs = () =>
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    )

  it('renders tabs', () => {
    renderTabs()
    expect(screen.getByRole('tablist')).toBeInTheDocument()
  })

  it('renders tab triggers', () => {
    renderTabs()
    expect(screen.getByRole('tab', { name: 'Tab 1' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Tab 2' })).toBeInTheDocument()
  })

  it('shows default content', () => {
    renderTabs()
    expect(screen.getByText('Content 1')).toBeInTheDocument()
  })

  it('switches content on click', async () => {
    const user = userEvent.setup()
    renderTabs()
    await user.click(screen.getByRole('tab', { name: 'Tab 2' }))
    expect(screen.getByText('Content 2')).toBeInTheDocument()
  })

  it('applies data-slot attributes', () => {
    renderTabs()
    expect(screen.getByRole('tablist')).toHaveAttribute(
      'data-slot',
      'tabs-list'
    )
  })

  it('supports disabled trigger', () => {
    render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">A</TabsTrigger>
          <TabsTrigger value="b" disabled>
            B
          </TabsTrigger>
        </TabsList>
        <TabsContent value="a">A content</TabsContent>
      </Tabs>
    )
    expect(screen.getByRole('tab', { name: 'B' })).toBeDisabled()
  })
})
