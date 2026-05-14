import type { Meta, StoryObj } from '@storybook/react-vite'

import { Calendar } from './calendar'

const meta = {
  title: 'UI/Calendar',
  component: Calendar,
  tags: ['autodocs'],
  argTypes: {
    mode: {
      control: 'select',
      options: ['single', 'range', 'multiple'],
    },
    captionLayout: {
      control: 'select',
      options: ['label', 'dropdown', 'dropdown-months', 'dropdown-years'],
    },
    showOutsideDays: { control: 'boolean' },
  },
} satisfies Meta<typeof Calendar>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    mode: 'single',
    showOutsideDays: true,
  },
}

export const WithSelectedDate: Story = {
  args: {
    mode: 'single',
    selected: new Date(),
    showOutsideDays: true,
  },
}

export const Range: Story = {
  args: {
    mode: 'range',
    showOutsideDays: true,
  },
}

export const WithDropdowns: Story = {
  args: {
    mode: 'single',
    captionLayout: 'dropdown-months',
    showOutsideDays: true,
  },
}
