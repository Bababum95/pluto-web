import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { DatePicker } from './date-picker'

const meta = {
  title: 'UI/DatePicker',
  component: DatePicker,
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    placeholder: { control: 'text' },
    isError: { control: 'boolean' },
  },
  args: {
    onChange: () => {},
  },
} satisfies Meta<typeof DatePicker>

export default meta

type Story = StoryObj<typeof meta>

function DatePickerWrapper(props: {
  label?: string
  placeholder?: string
  isError?: boolean
  errorMessage?: string
}) {
  const [value, setValue] = useState<Date | undefined>(undefined)
  return (
    <DatePicker
      value={value}
      onChange={setValue}
      label={props.label}
      placeholder={props.placeholder}
      isError={props.isError}
      errorMessage={props.errorMessage}
    />
  )
}

const storyArgs = { onChange: () => {} }

export const Default: Story = {
  args: storyArgs,
  render: () => <DatePickerWrapper />,
}

export const WithLabel: Story = {
  args: storyArgs,
  render: () => <DatePickerWrapper label="Select date" />,
}

export const WithPlaceholder: Story = {
  args: storyArgs,
  render: () => <DatePickerWrapper placeholder="Choose a date" />,
}

export const WithValue: Story = {
  args: storyArgs,
  render: () => {
    const [value, setValue] = useState<Date | undefined>(
      () => new Date(2025, 1, 28)
    )
    return <DatePicker value={value} onChange={setValue} label="Date" />
  },
}

export const WithError: Story = {
  args: storyArgs,
  render: () => <DatePickerWrapper isError errorMessage="Date is required" />,
}
