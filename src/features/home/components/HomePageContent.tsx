import { Link } from '@tanstack/react-router'
import type { FC } from 'react'

import { ChartPieDonutText } from '@/components/charts/chart-pie-donut-text'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { PlusButton } from '@/components/ui/button'
import { Item, ItemActions, ItemContent, ItemTitle } from '@/components/ui/item'
import { TimeRangeSwitcher } from '@/features/time-range'
import { useAppSelector } from '@/store'
import {
  selectTransactionsSummary,
  selectTransactionsGroupedByCategory,
} from '@/store/slices/transaction'
import { formatBalance } from '@/features/money'
import { DEFAULT_CURRENCY } from '@/features/money/constants'
import { Icon } from '@/components/ui/icon'

export const HomePageContent: FC = () => {
  const summary = useAppSelector(selectTransactionsSummary)
  const transactionsGroupedByCategory = useAppSelector(
    selectTransactionsGroupedByCategory
  )

  return (
    <div className="flex flex-col gap-2">
      <Card className="flex flex-col relative" size="sm">
        <CardHeader className="items-center pb-0">
          <TimeRangeSwitcher />
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <ChartPieDonutText
            total={formatBalance({
              balance: summary?.total ?? 0,
              currency: summary?.currency ?? DEFAULT_CURRENCY,
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
        {Object.entries(transactionsGroupedByCategory).map(
          ([key, transactions]) => {
            const category = transactions[0].category
            const currency = transactions[0].amount.converted.currency
            const total = transactions.reduce(
              (acc, transaction) => acc + transaction.amount.converted.raw,
              0
            )
            return (
              <Item variant="outline" size="xs" className="bg-card" key={key}>
                <Icon
                  name={category.icon}
                  data-slot="item-media"
                  color={category.color}
                  size={16}
                />
                <ItemContent>
                  <ItemTitle>{category.name}</ItemTitle>
                </ItemContent>
                <ItemActions>
                  <span className="font-medium">
                    {formatBalance({ currency, balance: total })}
                  </span>
                </ItemActions>
              </Item>
            )
          }
        )}
      </div>
    </div>
  )
}
