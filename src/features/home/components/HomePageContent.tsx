import { Link } from '@tanstack/react-router'
import type { FC } from 'react'

import { PlusButton } from '@/components/ui/button'
import { ChartPieDonutText } from '@/components/charts/chart-pie-donut-text'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Item, ItemActions, ItemContent, ItemTitle } from '@/components/ui/item'
import { Icon } from '@/components/ui/icon'
import { formatBalance, toDecimal } from '@/features/money'
import { TimeRangeSwitcher } from '@/features/time-range'
import { useAppSelector } from '@/store'
import {
  selectTransactionsSummary,
  selectTransactionsByCategory,
  selectTransactionsStatus,
} from '@/store/slices/transaction'
import { selectCurrency } from '@/store/slices/settings'

export const HomePageContent: FC = () => {
  const summary = useAppSelector(selectTransactionsSummary)
  const currency = useAppSelector(selectCurrency)
  const transactionsByCategory = useAppSelector(selectTransactionsByCategory)
  const status = useAppSelector(selectTransactionsStatus)

  return (
    <div className="flex flex-col gap-2">
      <Card className="flex flex-col relative" size="sm">
        <CardHeader className="items-center pb-0">
          <TimeRangeSwitcher />
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <ChartPieDonutText
            dataKey="total"
            nameKey="category"
            loading={status === 'pending'}
            chartData={transactionsByCategory.map(
              ({ category, total, scale }) => ({
                category: category.name,
                fill: category.color,
                total: toDecimal(total, scale),
              })
            )}
            chartConfig={transactionsByCategory.reduce(
              (acc, { category }) => ({
                ...acc,
                [category.name]: {
                  label: category.name,
                  color: category.color,
                },
              }),
              {}
            )}
            total={formatBalance({
              balance: summary?.total_raw ?? 0,
              currency: summary?.currency ?? currency,
            })}
          />
        </CardContent>
        <Link
          to="/transaction"
          className="absolute bottom-4 right-4 z-10"
          viewTransition={{ types: ['slide-left'] }}
        >
          <PlusButton />
        </Link>
      </Card>
      <div className="flex flex-col gap-1">
        {transactionsByCategory.map(({ category, total, scale }) => (
          <Item
            variant="outline"
            size="xs"
            className="bg-card"
            key={category.id}
          >
            <Icon
              name={category.icon}
              data-slot="item-media"
              color={category.color}
              size={24}
              className="p-1"
            />
            <ItemContent>
              <ItemTitle>{category.name}</ItemTitle>
            </ItemContent>
            <ItemActions>
              <span className="font-medium">
                {formatBalance({ currency, balance: toDecimal(total, scale) })}
              </span>
            </ItemActions>
          </Item>
        ))}
      </div>
    </div>
  )
}
