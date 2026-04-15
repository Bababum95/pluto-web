import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { AppLayout } from '@/components/AppLayout'
import { TransactionForm } from '@/features/transaction/components/TransactionForm'
import { DEFAULT_TRANSACTION_FORM_VALUES } from '@/features/transaction/constants'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { selectSettings } from '@/store/slices/settings'
import { createTransaction } from '@/store/slices/transaction'
import type { TransactionFormType } from '@/features/transaction/types'

export const Route = createFileRoute('/_app/transactions/create')({
  component: CreateTransactionPage,
})

function CreateTransactionPage() {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const settings = useAppSelector(selectSettings)

  const handleSubmit = async (values: TransactionFormType) => {
    if (!values.account) {
      throw new Error('Account is required')
    }

    await dispatch(createTransaction(values)).unwrap()
    navigate({ to: '/' })
    toast.success(t('transactions.messages.added'))
  }

  return (
    <AppLayout title={t('transactions.create')} showBackButton>
      <TransactionForm
        defaultValues={{
          ...DEFAULT_TRANSACTION_FORM_VALUES,
          account: settings?.account?.id ?? '',
        }}
        onSubmit={handleSubmit}
        key="create-transaction-form"
      />
    </AppLayout>
  )
}
