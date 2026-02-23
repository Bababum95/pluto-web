import type { Meta, StoryObj } from '@storybook/react-vite'

import { RadioGroup, RadioGroupItem } from './radio-group'
import { Label } from '@/components/ui/label'

const meta = {
  title: 'UI/RadioGroup',
  component: RadioGroup,
  tags: ['autodocs'],
} satisfies Meta<typeof RadioGroup>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <RadioGroup defaultValue="option-1">
      <div className="flex items-center gap-2">
        <RadioGroupItem value="option-1" id="option-1" />
        <Label htmlFor="option-1">Option 1</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="option-2" id="option-2" />
        <Label htmlFor="option-2">Option 2</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="option-3" id="option-3" />
        <Label htmlFor="option-3">Option 3</Label>
      </div>
    </RadioGroup>
  ),
}

export const WithDisabled: Story = {
  render: () => (
    <RadioGroup defaultValue="enabled">
      <div className="flex items-center gap-2">
        <RadioGroupItem value="enabled" id="enabled" />
        <Label htmlFor="enabled">Enabled</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="disabled" id="disabled" disabled />
        <Label htmlFor="disabled">Disabled</Label>
      </div>
    </RadioGroup>
  ),
}
