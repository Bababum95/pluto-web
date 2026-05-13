import type { Meta, StoryObj } from '@storybook/react-vite'

import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from './empty'

const meta = {
  title: 'UI/Empty',
  component: Empty,
  tags: ['autodocs'],
} satisfies Meta<typeof Empty>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: (
      <>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2v4" />
              <path d="m4.93 4.93 2.83 2.83" />
              <path d="M2 12h4" />
              <path d="m4.93 19.07 2.83-2.83" />
              <path d="M12 18v4" />
              <path d="m17.07 4.93-2.83 2.83" />
              <path d="M18 12h4" />
              <path d="m19.07 19.07-2.83-2.83" />
            </svg>
          </EmptyMedia>
          <EmptyTitle>No items yet</EmptyTitle>
          <EmptyDescription>
            Get started by adding your first item.
          </EmptyDescription>
        </EmptyHeader>
      </>
    ),
  },
}

export const WithContent: Story = {
  args: {
    children: (
      <EmptyContent>
        <EmptyHeader>
          <EmptyTitle>Empty state</EmptyTitle>
          <EmptyDescription>Description text goes here.</EmptyDescription>
        </EmptyHeader>
      </EmptyContent>
    ),
  },
}
