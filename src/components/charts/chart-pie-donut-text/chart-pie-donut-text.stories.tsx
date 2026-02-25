import type { Meta, StoryObj } from '@storybook/react-vite'

import { ChartPieDonutText } from './chart-pie-donut-text'

const sampleChartConfig = {
  category: { label: 'Category', color: 'hsl(var(--chart-1))' },
  total: { label: 'Total' },
}

const sampleData = [
  { category: 'A', total: 40, fill: 'var(--chart-1)' },
  { category: 'B', total: 35, fill: 'var(--chart-2)' },
  { category: 'C', total: 25, fill: 'var(--chart-3)' },
]

const meta = {
  title: 'Charts/ChartPieDonutText',
  component: ChartPieDonutText,
  tags: ['autodocs'],
  argTypes: {
    loading: { control: 'boolean' },
  },
} satisfies Meta<typeof ChartPieDonutText>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    total: '100',
    chartConfig: sampleChartConfig,
    chartData: sampleData,
    dataKey: 'total',
    nameKey: 'category',
    loading: false,
  },
}

export const Empty: Story = {
  args: {
    total: '0',
    chartConfig: sampleChartConfig,
    chartData: [],
    dataKey: 'total',
    nameKey: 'category',
    loading: false,
  },
}

export const Loading: Story = {
  args: {
    total: '—',
    chartConfig: sampleChartConfig,
    chartData: [],
    dataKey: 'total',
    nameKey: 'category',
    loading: true,
  },
}
