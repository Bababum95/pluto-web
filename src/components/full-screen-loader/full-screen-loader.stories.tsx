import type { Meta, StoryObj } from '@storybook/react-vite'

import { FullScreenLoader } from './full-screen-loader'

const meta = {
  title: 'Components/FullScreenLoader',
  component: FullScreenLoader,
  tags: ['autodocs'],
  argTypes: {
    isVisible: { control: 'boolean' },
  },
} satisfies Meta<typeof FullScreenLoader>

export default meta

type Story = StoryObj<typeof meta>

export const Visible: Story = {
  args: {
    isVisible: true,
  },
}

export const Hidden: Story = {
  args: {
    isVisible: false,
  },
}
