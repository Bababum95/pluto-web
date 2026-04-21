import type { Meta, StoryObj } from '@storybook/react-vite'

import { AppearanceProvider } from './AppearanceProvider'
import { AppearanceDrawer } from './AppearanceDrawer'

const meta = {
  title: 'Features/Appearance/AppearanceDrawer',
  component: AppearanceDrawer,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <AppearanceProvider>
        <Story />
      </AppearanceProvider>
    ),
  ],
} satisfies Meta<typeof AppearanceDrawer>

export default meta

type Story = StoryObj<typeof meta>

export const Open: Story = {
  render: (args) => <AppearanceDrawer {...args} />,
  args: {
    open: true,
    onClose: () => {},
  },
}
