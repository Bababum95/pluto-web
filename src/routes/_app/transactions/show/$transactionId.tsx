import { useEffect } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  Delete01Icon,
  MoreVerticalIcon,
  PencilEdit01Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

import { i18n } from '@/lib/i18n'
import dayjs from '@/lib/dayjs'
import { AppLayout } from '@/components/AppLayout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Icon } from '@/components/ui/icon'
import { Spinner } from '@/components/ui/spinner'
import { TransactionTypeTabs } from '@/features/transaction-type'
import { formatBalance } from '@/features/money'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  deleteTransaction,
  selectCurrentTransaction,
  setCurrent,
} from '@/store/slices/transaction'

const ShowTransactionPage = () => {
  const { transactionId } = Route.useParams()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const transaction = useAppSelector(selectCurrentTransaction)

  const handleDelete = async () => {
    await dispatch(deleteTransaction(transactionId)).unwrap()
    navigate({ to: '/transactions' })
    toast.success(t('transactions.messages.deleted'))
  }

  useEffect(() => {
    dispatch(setCurrent(transactionId))
  }, [dispatch, transactionId])

  if (!transaction) {
    return (
      <AppLayout title={t('transactions.title')} showBackButton>
        <TransactionTypeTabs>
          <div className="flex flex-1 items-center justify-center py-8">
            <Spinner size={32} />
          </div>
        </TransactionTypeTabs>
      </AppLayout>
    )
  }

  const { amount, account, category, date, comment, tags } = transaction
  const hasConverted =
    amount.converted.currency.code !== amount.original.currency.code

  return (
    <AppLayout
      title={t('transactions.title')}
      showBackButton
      actions={
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="[&_svg]:size-6">
              <HugeiconsIcon icon={MoreVerticalIcon} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuItem asChild>
              <Link
                to="/transactions/edit/$transactionId"
                params={{ transactionId }}
                viewTransition={{ types: ['slide-left'] }}
              >
                <HugeiconsIcon icon={PencilEdit01Icon} />
                <span>{t('transactions.actions.edit')}</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={handleDelete}>
              <HugeiconsIcon icon={Delete01Icon} />
              <span>{t('transactions.actions.delete')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      }
    >
      <TransactionTypeTabs>
        <Card size="sm" className="flex flex-1 flex-col">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <Icon
                name={category.icon}
                color={category.color}
                size={40}
                className="shrink-0"
              />
              <div className="min-w-0 flex-1">
                <CardTitle className="text-lg">{category.name}</CardTitle>
                <p className="text-muted-foreground text-sm">
                  {dayjs(date).locale(i18n.language).format('DD MMMM YYYY')}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground text-sm">
                {t('common.fields.amount')}
              </span>
              <p className="text-xl font-semibold tabular-nums">
                {formatBalance({
                  currency: amount.original.currency,
                  balance: amount.original.value,
                })}
              </p>
              {hasConverted && (
                <p className="text-muted-foreground text-sm tabular-nums">
                  {formatBalance({
                    currency: amount.converted.currency,
                    balance: amount.converted.value,
                  })}
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground text-sm">
                  {t('common.fields.account')}
                </span>
                <div className="flex items-center gap-2">
                  <Icon
                    name={account.icon}
                    color={account.color}
                    size={24}
                    className="shrink-0"
                  />
                  <span className="font-medium">{account.name}</span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground text-sm">
                  {t('common.fields.date')}
                </span>
                <span>
                  {dayjs(date).locale(i18n.language).format('DD MMMM YYYY')}
                </span>
              </div>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-muted-foreground text-sm">
                  {t('common.fields.tags')}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
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
              </div>
            )}

            {comment.trim().length > 0 && (
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground text-sm">
                  {t('common.fields.comment')}
                </span>
                <p className="whitespace-pre-wrap wrap-break-word text-sm">
                  {comment}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </TransactionTypeTabs>
    </AppLayout>
  )
}

export const Route = createFileRoute('/_app/transactions/show/$transactionId')({
  component: ShowTransactionPage,
})
