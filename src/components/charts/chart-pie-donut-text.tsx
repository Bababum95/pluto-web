'use client'

import { Label, Pie, PieChart } from 'recharts'
import type { FC } from 'react'

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { cn } from '@/lib/utils'

const LOADING_DATA = [{ category: 'loading', fill: '#00a4e8', total: 1 }]

type Props = {
  total: string
  chartConfig: ChartConfig
  chartData: Record<string, unknown>[]
  dataKey: string
  nameKey: string
  loading?: boolean
}

export const ChartPieDonutText: FC<Props> = ({
  total,
  chartConfig,
  chartData,
  dataKey,
  nameKey,
  loading = false,
}) => {
  const isLoading = loading && chartData.length === 0
  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square max-h-[250px] scale-125"
    >
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Pie
          data={isLoading ? LOADING_DATA : chartData}
          dataKey={dataKey}
          nameKey={nameKey}
          innerRadius={64}
          strokeWidth={5}
          paddingAngle={1}
          isAnimationActive={false}
          className={cn(isLoading && 'animate-pulse')}
        >
          <Label
            content={({ viewBox }) => {
              if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                return (
                  <text
                    x={viewBox.cx}
                    y={(viewBox.cy || 0) + 4}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className={cn(
                      'fill-foreground text-2xl font-semibold',
                      isLoading && 'animate-pulse'
                    )}
                  >
                    {total}
                  </text>
                )
              }
            }}
          />
        </Pie>
      </PieChart>
    </ChartContainer>
  )
}
