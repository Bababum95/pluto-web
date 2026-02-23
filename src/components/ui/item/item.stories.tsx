import type { Meta, StoryObj } from '@storybook/react-vite'

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
import { Button } from '@/components/ui/button'

const meta = {
  title: 'UI/Item',
  component: Item,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'outline', 'muted'],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'xs'],
    },
  },
} satisfies Meta<typeof Item>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Item>
      <ItemContent>
        <ItemTitle>Item Title</ItemTitle>
        <ItemDescription>A short item description.</ItemDescription>
      </ItemContent>
    </Item>
  ),
}

export const WithMedia: Story = {
  render: () => (
    <Item>
      <ItemMedia variant="icon">📦</ItemMedia>
      <ItemContent>
        <ItemTitle>With Media</ItemTitle>
        <ItemDescription>Item with an icon media slot.</ItemDescription>
      </ItemContent>
    </Item>
  ),
}

export const WithActions: Story = {
  render: () => (
    <Item>
      <ItemContent>
        <ItemTitle>Actionable Item</ItemTitle>
        <ItemDescription>This item has actions.</ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button variant="outline" size="sm">
          Edit
        </Button>
      </ItemActions>
    </Item>
  ),
}

export const Outlined: Story = {
  render: () => (
    <Item variant="outline">
      <ItemContent>
        <ItemTitle>Outlined Item</ItemTitle>
        <ItemDescription>Bordered variant.</ItemDescription>
      </ItemContent>
    </Item>
  ),
}

export const Muted: Story = {
  render: () => (
    <Item variant="muted">
      <ItemContent>
        <ItemTitle>Muted Item</ItemTitle>
        <ItemDescription>Muted background variant.</ItemDescription>
      </ItemContent>
    </Item>
  ),
}

export const GroupedWithSeparators: Story = {
  render: () => (
    <ItemGroup>
      <Item>
        <ItemContent>
          <ItemTitle>First Item</ItemTitle>
        </ItemContent>
      </Item>
      <ItemSeparator />
      <Item>
        <ItemContent>
          <ItemTitle>Second Item</ItemTitle>
        </ItemContent>
      </Item>
      <ItemSeparator />
      <Item>
        <ItemContent>
          <ItemTitle>Third Item</ItemTitle>
        </ItemContent>
      </Item>
    </ItemGroup>
  ),
}

export const SmallSize: Story = {
  render: () => (
    <Item size="sm">
      <ItemContent>
        <ItemTitle>Small Item</ItemTitle>
        <ItemDescription>Compact layout.</ItemDescription>
      </ItemContent>
    </Item>
  ),
}
