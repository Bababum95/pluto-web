import type { Meta, StoryObj } from '@storybook/react-vite'

import { PasswordInput } from './password-input'

const meta = {
  title: 'UI/PasswordInput',
  component: PasswordInput,
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: 'boolean' },
    placeholder: { control: 'text' },
  },
} satisfies Meta<typeof PasswordInput>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    placeholder: 'Enter password...',
  },
}

export const WithValue: Story = {
  args: {
    defaultValue: 'mysecretpassword',
  },
}

export const Disabled: Story = {
  args: {
    placeholder: 'Disabled',
    disabled: true,
  },
}
