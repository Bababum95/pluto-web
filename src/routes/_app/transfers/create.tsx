import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { AppLayout } from '@/components/AppLayout'
import { TransferForm, DEFAULT_TRANSFER_FORM_VALUES } from '@/features/transfer'
import { useAppDispatch } from '@/store'
import { createTransfer } from '@/store/slices/transfer'
import { fetchAccounts } from '@/store/slices/account'
import type { CreateTransferDto } from '@/features/transfer/types'

const CreateTransferPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const handleSubmit = async (values: CreateTransferDto) => {
    await dispatch(createTransfer(values)).unwrap()
    await dispatch(fetchAccounts())
    navigate({ to: '/transfers' })
    toast.success(t('transfers.created'))
  }

  return (
    <AppLayout title={t('transfers.create')} showBackButton>
      <TransferForm
        onSubmit={handleSubmit}
        defaultValues={DEFAULT_TRANSFER_FORM_VALUES}
      />
    </AppLayout>
  )
}

export const Route = createFileRoute('/_app/transfers/create')({
  component: CreateTransferPage,
})
