import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

import { ChartPieDonutText } from './chart-pie-donut-text'

const mockChartConfig = {
  category: { label: 'Category' },
  total: { label: 'Total' },
}

const mockChartData = [
  { category: 'A', total: 50, fill: '#888' },
  { category: 'B', total: 50, fill: '#444' },
]

describe('ChartPieDonutText', () => {
  it('renders chart container with data-slot', () => {
    const { container } = render(
      <ChartPieDonutText
        total="100"
        chartConfig={mockChartConfig}
        chartData={mockChartData}
        dataKey="total"
        nameKey="category"
      />
    )
    expect(container.querySelector('[data-slot="chart"]')).toBeInTheDocument()
  })

  it('renders without throwing when chartData is empty', () => {
    expect(() =>
      render(
        <ChartPieDonutText
          total="0"
          chartConfig={mockChartConfig}
          chartData={[]}
          dataKey="total"
          nameKey="category"
        />
      )
    ).not.toThrow()
  })

  it('renders when loading is true', () => {
    const { container } = render(
      <ChartPieDonutText
        total="—"
        chartConfig={mockChartConfig}
        chartData={[]}
        dataKey="total"
        nameKey="category"
        loading={true}
      />
    )
    expect(container.querySelector('[data-slot="chart"]')).toBeInTheDocument()
  })
})
