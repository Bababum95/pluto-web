import type { Meta, StoryObj } from '@storybook/react-vite'

import { LanguageDrawer } from './LanguageDrawer'

const meta = {
  title: 'Features/Settings/LanguageDrawer',
  component: LanguageDrawer,
  tags: ['autodocs'],
  args: {
    open: true,
    onClose: () => {},
  },
} satisfies Meta<typeof LanguageDrawer>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => <LanguageDrawer {...args} />,
}
