import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Delete01Icon, MoreVerticalIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

import dayjs from '@/lib/dayjs'
import { AppLayout } from '@/components/AppLayout'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { TransactionForm } from '@/features/transaction/components/TransactionForm'
import { TransactionTypeTabs } from '@/features/transaction-type'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  deleteTransaction,
  selectTransactionById,
  selectTransactionsStatus,
  updateTransaction,
} from '@/store/slices/transaction'
import type { TransactionFormType } from '@/features/transaction/types'

const EditTransactionPage = () => {
  const { transactionId } = Route.useParams()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const transaction = useAppSelector(selectTransactionById(transactionId))
  const status = useAppSelector(selectTransactionsStatus)
  const isLoading = status === 'pending'

  const handleSubmit = async (values: TransactionFormType) => {
    await dispatch(
      updateTransaction({ id: transactionId, data: values })
    ).unwrap()

    navigate({ to: '/transactions' })
    toast.success(t('transactions.updated'))
  }

  const handleDelete = async () => {
    await dispatch(deleteTransaction(transactionId)).unwrap()
    navigate({ to: '/transactions' })
    toast.success(t('transactions.deleted'))
  }

  if (isLoading || !transaction) {
    return (
      <AppLayout title={t('transactions.edit')} showBackButton>
        <TransactionTypeTabs>
          <div className="flex flex-1 items-center justify-center py-8">
            {isLoading ? t('common.loading') : t('transactions.notFound')}
          </div>
        </TransactionTypeTabs>
      </AppLayout>
    )
  }

  return (
    <AppLayout
      title={t('transactions.edit')}
      showBackButton
      actions={
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="[&_svg]:size-6">
              <HugeiconsIcon icon={MoreVerticalIcon} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuItem variant="destructive" onClick={handleDelete}>
              <HugeiconsIcon icon={Delete01Icon} />
              <span>{t('transactions.actions.delete')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      }
    >
      <TransactionTypeTabs>
        <TransactionForm
          defaultValues={{
            amount: transaction.amount.original.value.toString(),
            account: transaction.account.id,
            comment: transaction.comment ?? '',
            category: transaction.category.id,
            tags: transaction.tags.map((tag) => tag.id),
            date: dayjs(transaction.date).toDate(),
          }}
          amountCurrency={transaction.amount.original.currency.code}
          submitLabel={t('transactions.save')}
          onSubmit={handleSubmit}
          key={`edit-transaction-form-${transaction.id}`}
        />
      </TransactionTypeTabs>
    </AppLayout>
  )
}

export const Route = createFileRoute('/_app/transactions/$transactionId')({
  component: EditTransactionPage,
})
