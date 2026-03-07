import { i18n, useTranslation } from '@/lib/i18n'
import { createFileRoute } from '@tanstack/react-router'
import { Fragment } from 'react'

import dayjs from '@/lib/dayjs'
import { AppLayout } from '@/components/AppLayout'
import { useAppSelector } from '@/store'
import { selectTransactionsByDay } from '@/store/slices/transaction'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TimeRangeSwitcher } from '@/features/time-range/components/TimeRangeSwitcher'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemSeparator,
  ItemTitle,
} from '@/components/ui/item'
import { Icon } from '@/components/ui/icon'
import { formatBalance } from '@/features/money'

const TransactionsPage = () => {
  const { t } = useTranslation()
  const transactions = useAppSelector(selectTransactionsByDay)

  console.log(transactions)

  return (
    <AppLayout title={t('transactions.title')} className="px-2" showBackButton>
      <Card className="flex flex-col relative" size="sm">
        <CardHeader className="items-center pb-0">
          <TimeRangeSwitcher />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {transactions.map(({ date, list }) => (
              <Card key={date} size="sm" className="bg-muted/50 rounded-md pb-0!">
                <CardHeader>
                  <CardTitle>
                    {dayjs(date).locale(i18n.language).format('DD MMMM YYYY')}
                  </CardTitle>
                </CardHeader>

                <ItemGroup>
                  {list.map((transaction) => (
                    <Fragment key={transaction.id}>
                      <ItemSeparator />
                      <Item size="xs">
                        <Icon
                          name={transaction.category.icon}
                          data-slot="item-media"
                          color={transaction.category.color}
                          size={24}
                        />
                        <ItemContent>
                          <ItemTitle>{transaction.category.name}</ItemTitle>
                          <ItemDescription>
                            {transaction.comment}
                          </ItemDescription>
                        </ItemContent>
                        <ItemActions className="flex flex-col items-end gap-0">
                          <span className="font-medium">
                            {formatBalance({
                              currency: transaction.amount.converted.currency,
                              balance: transaction.amount.converted.value,
                            })}
                          </span>
                          <span className="text-muted-foreground">
                            {formatBalance({
                              currency: transaction.amount.original.currency,
                              balance: transaction.amount.original.value,
                            })}
                          </span>
                        </ItemActions>
                      </Item>
                    </Fragment>
                  ))}
                </ItemGroup>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  )
}
export const Route = createFileRoute('/_app/transactions/')({
  component: TransactionsPage,
})
