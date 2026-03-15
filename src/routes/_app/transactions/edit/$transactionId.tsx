import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Delete01Icon, MoreVerticalIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useEffect, useState } from 'react'

import dayjs from '@/lib/dayjs'
import { AppLayout } from '@/components/AppLayout'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { TransactionForm } from '@/features/transaction/components/TransactionForm'
import { TransactionTypeTabs } from '@/features/transaction-type'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  deleteTransaction,
  selectCurrentTransaction,
  setCurrent,
  updateTransaction,
} from '@/store/slices/transaction'
import { parseDecimal } from '@/features/money'
import type { TransactionFormType } from '@/features/transaction/types'

const EditTransactionPage = () => {
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState<'recalc' | 'skip' | false>(
    false
  )
  const [pendingValues, setPendingValues] =
    useState<TransactionFormType | null>(null)
  const { transactionId } = Route.useParams()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const transaction = useAppSelector(selectCurrentTransaction)

  const confirmBalanceChange = async (values: TransactionFormType) => {
    const { balance, scale } = parseDecimal(values.amount)
    if (
      values.account !== transaction?.account.id ||
      scale !== transaction?.amount.original.scale ||
      balance !== transaction?.amount.original.value
    ) {
      setPendingValues(values)
      setIsOpenConfirmModal(true)
    } else {
      await handleSubmit(values)
    }
  }

  const handleSubmit = async (
    values: TransactionFormType | null,
    recalcBalance: boolean = false
  ) => {
    if (!values) return
    setIsSubmitting(recalcBalance ? 'recalc' : 'skip')

    await dispatch(
      updateTransaction({ id: transactionId, data: values, recalcBalance })
    ).unwrap()

    if (pendingValues) setPendingValues(null)
    setIsSubmitting(false)
    setIsOpenConfirmModal(false)
    navigate({ to: '/transactions' })
    toast.success(t('transactions.messages.updated'))
  }

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
      <AppLayout title={t('transactions.actions.edit')} showBackButton>
        <TransactionTypeTabs>
          <div className="flex flex-1 items-center justify-center py-8">
            {t('transactions.messages.notFound')}
          </div>
        </TransactionTypeTabs>
      </AppLayout>
    )
  }

  return (
    <AppLayout
      title={t('transactions.actions.edit')}
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
          submitLabel={t('transactions.actions.save')}
          onSubmit={confirmBalanceChange}
          key={`edit-transaction-form-${transaction.id}`}
        />
      </TransactionTypeTabs>
      <Dialog
        modal
        open={isOpenConfirmModal}
        onOpenChange={setIsOpenConfirmModal}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {t('transactions.recalculateBalance.title')}
            </DialogTitle>
            <DialogDescription>
              {t('transactions.recalculateBalance.description')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row gap-2 flex-wrap">
            <Button
              onClick={() => handleSubmit(pendingValues, true)}
              isLoading={isSubmitting === 'recalc'}
              disabled={!!isSubmitting}
              className="flex-1"
            >
              {t('transactions.recalculateBalance.submit')}
            </Button>
            <Button
              onClick={() => handleSubmit(pendingValues, false)}
              isLoading={isSubmitting === 'skip'}
              disabled={!!isSubmitting}
              variant="outline"
              className="flex-1"
            >
              {t('transactions.recalculateBalance.skip')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  )
}

export const Route = createFileRoute('/_app/transactions/edit/$transactionId')({
  component: EditTransactionPage,
})
