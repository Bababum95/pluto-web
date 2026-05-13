import type { Meta, StoryObj } from '@storybook/react-vite'

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupButton,
} from './input-group'

const meta = {
  title: 'UI/InputGroup',
  component: InputGroup,
  tags: ['autodocs'],
} satisfies Meta<typeof InputGroup>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <InputGroup>
      <InputGroupInput placeholder="Enter value..." />
    </InputGroup>
  ),
}

export const WithAddonStart: Story = {
  render: () => (
    <InputGroup>
      <InputGroupAddon align="inline-start">$</InputGroupAddon>
      <InputGroupInput placeholder="0.00" />
    </InputGroup>
  ),
}

export const WithAddonEnd: Story = {
  render: () => (
    <InputGroup>
      <InputGroupInput placeholder="0.00" />
      <InputGroupAddon align="inline-end">USD</InputGroupAddon>
    </InputGroup>
  ),
}

export const WithButton: Story = {
  render: () => (
    <InputGroup>
      <InputGroupInput placeholder="Search..." />
      <InputGroupAddon align="inline-end">
        <InputGroupButton>Go</InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  ),
}

export const WithBothAddons: Story = {
  render: () => (
    <InputGroup>
      <InputGroupAddon align="inline-start">https://</InputGroupAddon>
      <InputGroupInput placeholder="example.com" />
      <InputGroupAddon align="inline-end">.com</InputGroupAddon>
    </InputGroup>
  ),
}
