import { i18n, useTranslation } from '@/lib/i18n'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Fragment } from 'react'

import dayjs from '@/lib/dayjs'
import { AppLayout } from '@/components/AppLayout'
import { TransactionTypeTabs } from '@/features/transaction-type'
import { useAppSelector } from '@/store'
import { selectTransactionsByDay } from '@/store/slices/transaction'
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
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
import { Badge } from '@/components/ui/badge'

const TransactionsPage = () => {
  const { t } = useTranslation()
  const transactions = useAppSelector(selectTransactionsByDay)

  return (
    <AppLayout title={t('transactions.title')} className="px-2" showBackButton>
      <TransactionTypeTabs>
        <Card className="flex flex-col relative" size="sm">
          <CardHeader className="items-center pb-0">
            <TimeRangeSwitcher />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              {transactions.map(({ date, list, total }) => (
                <Card
                  key={date}
                  size="sm"
                  className="bg-muted/50 rounded-md pb-0!"
                >
                  <CardHeader>
                    <CardTitle className="text-lg!">
                      {dayjs(date).locale(i18n.language).format('DD MMMM YYYY')}
                    </CardTitle>
                    <CardAction>
                      <span className="font-medium text-lg">
                        {formatBalance({
                          currency: total.currency,
                          balance: toDecimal(total.raw, total.scale),
                        })}
                      </span>
                    </CardAction>
                  </CardHeader>

                  <ItemGroup>
                    {list.map((transaction) => (
                      <Fragment key={transaction.id}>
                        <ItemSeparator />
                        <Item
                          className="active:scale-95 select-none"
                          size="xs"
                          asChild
                        >
                          <Link
                            to="/transactions/$transactionId"
                            params={{ transactionId: transaction.id }}
                            viewTransition={{ types: ['slide-left'] }}
                          >
                            <Icon
                              name={transaction.category.icon}
                              data-slot="item-media"
                              color={transaction.category.color}
                              size={24}
                            />
                            <ItemContent className="gap-0">
                              <ItemTitle>{transaction.category.name}</ItemTitle>
                              <ItemDescription>
                                {transaction.account.name}
                              </ItemDescription>
                            </ItemContent>
                            <ItemActions className="flex flex-col items-end gap-0">
                              <span className="font-medium">
                                {formatBalance({
                                  currency:
                                    transaction.amount.converted.currency,
                                  balance: transaction.amount.converted.value,
                                })}
                              </span>
                              <span className="text-muted-foreground">
                                {formatBalance({
                                  currency:
                                    transaction.amount.original.currency,
                                  balance: transaction.amount.original.value,
                                })}
                              </span>
                            </ItemActions>
                            <div className="w-full">
                              <div className="flex gap-1 flex-wrap">
                                {transaction.tags.map((tag) => (
                                  <Badge
                                    key={tag.id}
                                    variant="default"
                                    color={tag.color}
                                    size="xs"
                                  >
                                    {tag.name}
                                  </Badge>
                                ))}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {transaction.comment}
                              </p>
                            </div>
                          </Link>
                        </Item>
                      </Fragment>
                    ))}
                  </ItemGroup>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </TransactionTypeTabs>
    </AppLayout>
  )
}
export const Route = createFileRoute('/_app/transactions/')({
  component: TransactionsPage,
})
