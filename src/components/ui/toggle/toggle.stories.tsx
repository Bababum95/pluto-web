import type { Meta, StoryObj } from "@storybook/react-vite"

import { Toggle } from "./toggle"

const meta = {
  title: "UI/Toggle",
  component: Toggle,
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
    pressed: { control: "boolean" },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof Toggle>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    "aria-label": "Toggle income",
    children: "Income",
    variant: "default",
    size: "default",
  },
}

export const Outline: Story = {
  args: {
    "aria-label": "Toggle expense",
    children: "Expense",
    variant: "outline",
    size: "default",
  },
}

export const Pressed: Story = {
  args: {
    "aria-label": "Pressed toggle",
    children: "Selected",
    pressed: true,
  },
}

export const Disabled: Story = {
  args: {
    "aria-label": "Disabled toggle",
    children: "Disabled",
    disabled: true,
  },
}
