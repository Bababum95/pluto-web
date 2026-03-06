import { i18n, useTranslation } from '@/lib/i18n'
import { createFileRoute } from '@tanstack/react-router'
import { Fragment } from 'react'

import dayjs from '@/lib/dayjs'
import { AppLayout } from '@/components/AppLayout'
import { useAppSelector } from '@/store'
import { selectTransactionsByDay } from '@/store/slices/transaction'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
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
import { formatBalance, toDecimal } from '@/features/money'

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
              <Card key={date} size="sm" className="bg-muted/50 rounded-md">
                <CardHeader>
                  <CardTitle>
                    {dayjs(date).locale(i18n.language).format('DD MMMM YYYY')}
                  </CardTitle>
                </CardHeader>

                <ItemGroup>
                  <ItemSeparator />
                  {list.map((transaction) => (
                    <Fragment key={transaction.id}>
                      <Item key={transaction.id} size="xs">
                        <Icon
                          name={transaction.category.icon}
                          data-slot="item-media"
                          color={transaction.category.color}
                          size={24}
                          className="p-1"
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
                              balance: toDecimal(
                                transaction.amount.converted.value,
                                transaction.amount.converted.scale
                              ),
                            })}
                          </span>
                          <span className="text-muted-foreground">
                            {formatBalance({
                              currency: transaction.amount.original.currency,
                              balance: toDecimal(
                                transaction.amount.original.value,
                                transaction.amount.original.scale
                              ),
                            })}
                          </span>
                        </ItemActions>
                      </Item>
                      <ItemSeparator />
                    </Fragment>
                  ))}
                </ItemGroup>
                <CardFooter>Total</CardFooter>
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
