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
} satisfies Meta<typeof DatePicker>

export default meta

type Story = StoryObj<typeof meta>

function DatePickerWrapper(props: {
  label?: string
  placeholder?: string
  isError?: boolean
  errorMessage?: string
}) {
  const [value, setValue] = useState('')
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

export const Default: Story = {
  render: () => <DatePickerWrapper />,
}

export const WithLabel: Story = {
  render: () => <DatePickerWrapper label="Select date" />,
}

export const WithPlaceholder: Story = {
  render: () => <DatePickerWrapper placeholder="Choose a date" />,
}

export const WithValue: Story = {
  render: () => {
    const [value, setValue] = useState('28.02.2025')
    return <DatePicker value={value} onChange={setValue} label="Date" />
  },
}

export const WithError: Story = {
  render: () => <DatePickerWrapper isError errorMessage="Date is required" />,
}
