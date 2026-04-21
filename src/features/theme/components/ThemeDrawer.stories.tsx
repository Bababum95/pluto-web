import type { Meta, StoryObj } from '@storybook/react-vite'

import { ThemeProvider } from './ThemeProvider'
import { ThemeDrawer } from './ThemeDrawer'

const meta = {
  title: 'Features/Theme/ThemeDrawer',
  component: ThemeDrawer,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div className="p-4">
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  args: {
    open: true,
    onClose: () => undefined,
  },
} satisfies Meta<typeof ThemeDrawer>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => <ThemeDrawer {...args} />,
}
