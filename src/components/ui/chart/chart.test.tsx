import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import {
  ChartContainer,
  ChartLegendContent,
  ChartStyle,
  ChartTooltipContent,
  type ChartConfig,
} from './chart'

vi.mock('recharts', async () => {
  await import('react')

  return {
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="responsive-container">{children}</div>
    ),
    Tooltip: () => null,
    Legend: () => null,
  }
})

const chartConfig: ChartConfig = {
  income: { label: 'Income', color: '#22c55e' },
  expense: {
    label: 'Expense',
    theme: { light: '#ef4444', dark: '#fca5a5' },
  },
}

describe('chart ui helpers', () => {
  it('renders chart container and injects css variables for themed series', () => {
    const { container } = render(
      <ChartContainer config={chartConfig}>
        <div>Chart content</div>
      </ChartContainer>
    )

    expect(container.querySelector('[data-slot="chart"]')).toBeInTheDocument()
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument()

    const styleTag = container.querySelector('style')
    expect(styleTag?.textContent).toContain('--color-income: #22c55e;')
    expect(styleTag?.textContent).toContain('--color-expense: #ef4444;')
  })

  it('returns null from ChartStyle when no color config is provided', () => {
    const { container } = render(
      <ChartStyle
        id="plain"
        config={{
          total: { label: 'Total' },
        }}
      />
    )

    expect(container.firstChild).toBeNull()
  })

  it('throws when tooltip content is rendered outside chart context', () => {
    expect(() =>
      render(
        <ChartTooltipContent
          active={true}
          payload={[{ name: 'income', value: 100, dataKey: 'income' }]}
        />
      )
    ).toThrow('useChart must be used within a <ChartContainer />')
  })

  it('renders tooltip label, indicator and formatted values inside chart context', () => {
    render(
      <ChartContainer config={chartConfig}>
        <ChartTooltipContent
          active={true}
          label="income"
          payload={[
            {
              name: 'income',
              value: 1200,
              dataKey: 'income',
              color: '#22c55e',
              payload: { fill: '#22c55e' },
            },
          ]}
        />
      </ChartContainer>
    )

    expect(screen.getAllByText('Income').length).toBeGreaterThan(0)
    expect(screen.getByText('1,200')).toBeInTheDocument()
  })

  it('uses custom formatter and nested payload key resolution', () => {
    render(
      <ChartContainer config={chartConfig}>
        <ChartTooltipContent
          active={true}
          indicator="dashed"
          nameKey="category"
          payload={[
            {
              name: 'fallback',
              value: 42,
              dataKey: 'expense',
              payload: { category: 'expense', fill: '#ef4444' },
            },
          ]}
          formatter={(value) => <span>formatted-{value}</span>}
        />
      </ChartContainer>
    )

    expect(screen.getByText('formatted-42')).toBeInTheDocument()
  })

  it('renders legend content with and without icons', () => {
    const DotIcon = () => <span data-testid="legend-icon">icon</span>

    render(
      <ChartContainer
        config={{
          income: { label: 'Income', icon: DotIcon, color: '#22c55e' },
        }}
      >
        <ChartLegendContent
          payload={[
            { value: 'income', dataKey: 'income', color: '#22c55e' },
            { value: 'none', dataKey: 'none', type: 'none', color: '#000' },
          ]}
        />
      </ChartContainer>
    )

    expect(screen.getByText('Income')).toBeInTheDocument()
    expect(screen.getByTestId('legend-icon')).toBeInTheDocument()
  })
})
