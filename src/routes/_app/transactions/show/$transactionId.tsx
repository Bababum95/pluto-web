import { useEffect, type FC, type PropsWithChildren } from 'react'
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
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Spinner } from '@/components/ui/spinner'
import { formatBalance } from '@/features/money'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  deleteTransaction,
  selectCurrentTransaction,
  setCurrent,
} from '@/store/slices/transaction'
import { Separator } from '@/components/ui/separator'

const Row: FC<PropsWithChildren> = ({ children }) => (
  <div className="flex justify-between text-base gap-2">{children}</div>
)

const Label: FC<PropsWithChildren> = ({ children }) => (
  <span className="text-muted-foreground">{children}</span>
)

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
        <div className="flex flex-1 items-center justify-center py-8">
          <Spinner size={32} />
        </div>
      </AppLayout>
    )
  }

  const { amount, account, category, date, comment, tags, createdAt } =
    transaction
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
      <Card size="sm" className="flex flex-col">
        <CardContent className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Row>
              <Label>{t('common.fields.amount')}</Label>
              <div className="flex flex-col items-end">
                <span>
                  {formatBalance({
                    currency: amount.original.currency,
                    balance: amount.original.value,
                  })}
                </span>
                {hasConverted && (
                  <span className="text-muted-foreground">
                    {formatBalance({
                      currency: amount.converted.currency,
                      balance: amount.converted.value,
                    })}
                  </span>
                )}
              </div>
            </Row>
            <Separator />
            <Row>
              <Label>{t('common.fields.category')}</Label>
              <span>{category.name}</span>
            </Row>
            <Separator />
            <Row>
              <Label>{t('common.fields.account')}</Label>
              <span>{account.name}</span>
            </Row>
            <Separator />
            <Row>
              <Label>{t('common.fields.date')}</Label>
              <span>
                {dayjs(date).locale(i18n.language).format('DD MMMM YYYY')}
              </span>
            </Row>
            <Separator />
            {tags.length > 0 && (
              <>
                <Row>
                  <Label>{t('common.fields.tags')}</Label>
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
                </Row>
                <Separator />
              </>
            )}
            {comment.trim().length > 0 && (
              <>
                <Row>
                  <span className="text-muted-foreground text-sm">
                    {t('common.fields.comment')}
                  </span>
                  <p className="whitespace-pre-wrap wrap-break-word text-sm">
                    {comment}
                  </p>
                </Row>
                <Separator />
              </>
            )}
            <Row>
              <Label>{t('common.fields.createdAt')}</Label>
              <span>
                {dayjs(createdAt)
                  .locale(i18n.language)
                  .format('DD.MM.YYYY HH:mm')}
              </span>
            </Row>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  )
}

export const Route = createFileRoute('/_app/transactions/show/$transactionId')({
  component: ShowTransactionPage,
})
