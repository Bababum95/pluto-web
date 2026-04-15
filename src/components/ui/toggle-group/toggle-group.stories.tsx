import type { Meta, StoryObj } from "@storybook/react-vite"

import { ToggleGroup, ToggleGroupItem } from "./toggle-group"

const meta = {
  title: "UI/ToggleGroup",
  component: ToggleGroup,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "outline"],
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg"],
    },
    spacing: { control: "number" },
    orientation: {
      control: "inline-radio",
      options: ["horizontal", "vertical"],
    },
  },
} satisfies Meta<typeof ToggleGroup>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    type: "single",
    defaultValue: "income",
    spacing: 0,
    variant: "default",
    size: "default",
  },
  render: (args) => (
    <ToggleGroup {...args}>
      <ToggleGroupItem value="income">Income</ToggleGroupItem>
      <ToggleGroupItem value="expense">Expense</ToggleGroupItem>
    </ToggleGroup>
  ),
}

export const Outline: Story = {
  args: {
    type: "single",
    defaultValue: "income",
    spacing: 0,
    variant: "outline",
    size: "default",
  },
  render: (args) => (
    <ToggleGroup {...args}>
      <ToggleGroupItem value="income">Income</ToggleGroupItem>
      <ToggleGroupItem value="expense">Expense</ToggleGroupItem>
    </ToggleGroup>
  ),
}

export const WithSpacing: Story = {
  args: {
    type: "single",
    defaultValue: "income",
    spacing: 2,
  },
  render: (args) => (
    <ToggleGroup {...args}>
      <ToggleGroupItem value="income">Income</ToggleGroupItem>
      <ToggleGroupItem value="expense">Expense</ToggleGroupItem>
    </ToggleGroup>
  ),
}

export const Vertical: Story = {
  args: {
    type: "single",
    defaultValue: "income",
    orientation: "vertical",
    spacing: 1,
    variant: "outline",
  },
  render: (args) => (
    <ToggleGroup {...args}>
      <ToggleGroupItem value="income">Income</ToggleGroupItem>
      <ToggleGroupItem value="expense">Expense</ToggleGroupItem>
    </ToggleGroup>
  ),
}
