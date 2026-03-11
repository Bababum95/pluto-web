import { i18n, useTranslation } from '@/lib/i18n'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Fragment } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Invoice01Icon, PlusSignIcon } from '@hugeicons/core-free-icons'

import dayjs from '@/lib/dayjs'
import { AppLayout } from '@/components/AppLayout'
import { TransactionTypeTabs } from '@/features/transaction-type'
import { useAppSelector } from '@/store'
import {
  selectTransactionsByDay,
  selectTransactionsStatus,
} from '@/store/slices/transaction'
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
import { Spinner } from '@/components/ui/spinner'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { Button } from '@/components/ui/button'

const TransactionsPage = () => {
  const { t } = useTranslation()
  const transactions = useAppSelector(selectTransactionsByDay)
  const status = useAppSelector(selectTransactionsStatus)

  return (
    <AppLayout
      title={t('transactions.title')}
      backPath="/"
      showBackButton
      actions={
        <Button variant="ghost" size="icon" asChild>
          <Link
            to="/transactions/create"
            viewTransition={{ types: ['slide-left'] }}
          >
            <HugeiconsIcon icon={PlusSignIcon} />
          </Link>
        </Button>
      }
    >
      <TransactionTypeTabs>
        <Card className="flex flex-col relative" size="sm">
          <CardHeader className="items-center pb-0">
            <TimeRangeSwitcher />
          </CardHeader>
          <CardContent>
            {status === 'pending' ? (
              <div className="flex items-center justify-center py-8">
                <Spinner size={32} />
              </div>
            ) : transactions.length > 0 ? (
              <div className="flex flex-col gap-4">
                {transactions.map(({ date, list, total }) => (
                  <Card
                    key={date}
                    size="sm"
                    className="bg-muted/50 rounded-md pb-0!"
                  >
                    <CardHeader>
                      <CardTitle className="text-lg!">
                        {dayjs(date)
                          .locale(i18n.language)
                          .format('DD MMMM YYYY')}
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
                          <Item size="xs" asChild>
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
                                <ItemTitle>
                                  {transaction.category.name}
                                </ItemTitle>
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
                              {transaction.tags.length > 0 && (
                                <div className="flex gap-1 flex-wrap w-full">
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
                              )}
                              {transaction.comment.trim().length > 0 && (
                                <p className="text-xs text-muted-foreground w-full">
                                  {transaction.comment}
                                </p>
                              )}
                            </Link>
                          </Item>
                        </Fragment>
                      ))}
                    </ItemGroup>
                  </Card>
                ))}
              </div>
            ) : (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <HugeiconsIcon icon={Invoice01Icon} />
                  </EmptyMedia>
                  <EmptyTitle>{t('transactions.empty.title')}</EmptyTitle>
                  <EmptyDescription>
                    {t('transactions.empty.description')}
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent className="flex-row justify-center">
                  <Button>
                    <Link
                      to="/transactions/create"
                      viewTransition={{ types: ['slide-left'] }}
                    >
                      {t('transactions.empty.createTransaction')}
                    </Link>
                  </Button>
                </EmptyContent>
              </Empty>
            )}
          </CardContent>
        </Card>
      </TransactionTypeTabs>
    </AppLayout>
  )
}
export const Route = createFileRoute('/_app/transactions/')({
  component: TransactionsPage,
})
