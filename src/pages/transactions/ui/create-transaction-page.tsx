import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { AppLayout } from '@/widgets/app-shell'
import {
  DEFAULT_TRANSACTION_FORM_VALUES,
  TransactionForm,
} from '@/features/transaction'
import type { TransactionFormType } from '@/features/transaction'
import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import { selectSettings } from '@/entities/settings'
import { createTransaction } from '@/entities/transaction'

export function CreateTransactionPage() {
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
