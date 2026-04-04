import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import type { DateRange } from 'react-day-picker'

import { DatePickerRange } from './date-picker-range'

const meta = {
  title: 'UI/DatePickerRange',
  component: DatePickerRange,
  tags: ['autodocs'],
  args: {
    onChange: () => {},
  },
} satisfies Meta<typeof DatePickerRange>

export default meta

type Story = StoryObj<typeof meta>

function DatePickerRangeWrapper(props: { initial?: DateRange }) {
  const [value, setValue] = useState<DateRange | undefined>(props.initial)
  return <DatePickerRange value={value} onChange={setValue} />
}

const storyArgs = { onChange: () => {} }

export const Default: Story = {
  args: storyArgs,
  render: () => <DatePickerRangeWrapper />,
}

export const WithRange: Story = {
  args: storyArgs,
  render: () => (
    <DatePickerRangeWrapper
      initial={{
        from: new Date(2025, 0, 10),
        to: new Date(2025, 0, 20),
      }}
    />
  ),
}

export const StartDateOnly: Story = {
  args: storyArgs,
  render: () => (
    <DatePickerRangeWrapper
      initial={{
        from: new Date(2025, 0, 10),
      }}
    />
  ),
}
