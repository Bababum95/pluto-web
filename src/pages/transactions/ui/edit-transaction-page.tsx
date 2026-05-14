import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { MoreVerticalIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useEffect, useState } from 'react'

import dayjs from '@/shared/lib/date/dayjs'
import { AppLayout } from '@/widgets/app-shell'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/ui/dialog'
import { TransactionForm, TransactionDeleteMenuItem } from '@/features/transaction'
import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import {
  deleteTransaction,
  selectCurrentTransaction,
  setCurrent,
  updateTransaction,
} from '@/entities/transaction'
import { parseDecimal } from '@/shared/lib/money/utils/parseDecimal'
import type { TransactionFormType } from '@/features/transaction'

export type EditTransactionPageProps = {
  transactionId: string
}

export function EditTransactionPage({
  transactionId,
}: EditTransactionPageProps) {
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState<'recalc' | 'skip' | false>(
    false
  )
  const [pendingValues, setPendingValues] =
    useState<TransactionFormType | null>(null)
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
    if (transactionId.startsWith('temp-')) {
      return (
        <AppLayout title={t('transactions.actions.edit')} showBackButton>
          <div className="flex flex-1 items-center justify-center py-8 text-muted-foreground">
            {t('sync.pending')}
          </div>
        </AppLayout>
      )
    }
    return (
      <AppLayout title={t('transactions.actions.edit')} showBackButton>
        <div className="flex flex-1 items-center justify-center py-8">
          {t('transactions.messages.notFound')}
        </div>
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
            <TransactionDeleteMenuItem onSelect={handleDelete} />
          </DropdownMenuContent>
        </DropdownMenu>
      }
    >
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
