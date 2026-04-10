import type { Meta, StoryObj } from '@storybook/react-vite'

import { Label } from '@/components/ui/label'

import { Switch } from './switch'

const meta = {
  title: 'UI/Switch',
  component: Switch,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'default'],
    },
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    'aria-label': 'Toggle setting',
  },
} satisfies Meta<typeof Switch>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    size: 'default',
  },
}

export const Small: Story = {
  args: {
    size: 'sm',
  },
}

export const Checked: Story = {
  args: {
    checked: true,
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
  },
}

export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Switch id="marketing-updates" />
      <Label htmlFor="marketing-updates">Marketing updates</Label>
    </div>
  ),
}
